import os
import random
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from db import db
from interview.predictor import evaluate_answer, generate_question_bank

router = APIRouter()

ADMIN_KEY = os.getenv("ADMIN_KEY")


class QuestionBankRequest(BaseModel):
    role: str


class StartInterviewRequest(BaseModel):
    role: Optional[str] = None
    domain: Optional[str] = None
    user_id: Optional[str] = None


class EvaluateAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str


class FinalEvaluateRequest(BaseModel):
    session_id: Optional[str] = None
    questions: List[str]
    answers: List[str]
    state: Optional[dict] = None
    duration: Optional[int] = 0
    user_id: Optional[str] = None


def _select_questions(bank: dict) -> List[str]:
    try:
        return [
            random.choice(bank["introduction"]),
            *random.sample(bank["technical"], 3),
            *random.sample(bank["scenario"], 3),
            *random.sample(bank["behavioral"], 2),
            *random.sample(bank["hr"], 1),
        ]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to select questions: {exc}")


def _normalize_role(role: str) -> str:
    return role.strip().title()


def _create_session_doc(session_id: str, role: str, questions: List[str], user_id: Optional[str]):
    return {
        "session_id": session_id,
        "user_id": user_id,
        "role": role,
        "questions": questions,
        "answers": [],
        "technical_score": 0.0,
        "behavioral_score": 0.0,
        "communication_score": 0.0,
        "overall_score": 0.0,
        "status": "in_progress",
        "createdAt": datetime.utcnow(),
    }


def _build_consensus(results: List[dict], field: str) -> float:
    values = [float(item.get(field, 0)) for item in results if item.get(field) is not None]
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)


def _unique_list(items: List) -> List:
    return list(dict.fromkeys([item for sublist in items for item in (sublist if isinstance(sublist, list) else [sublist]) if item]))


@router.post("/generate_question_bank")
def generate_question_bank_route(
    payload: QuestionBankRequest,
    x_admin_key: Optional[str] = Header(None),
):
    if ADMIN_KEY and x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Admin credentials required")

    role = _normalize_role(payload.role)
    existing = db.question_bank.find_one({"role": role})
    if existing:
        existing.pop("_id", None)
        return {"message": "Question bank already exists", "question_bank": existing}

    question_bank = generate_question_bank(role)
    db.question_bank.insert_one(question_bank)
    question_bank.pop("_id", None)
    return {"message": "Question bank generated", "question_bank": question_bank}


@router.post("/start_interview")
def start_interview(payload: StartInterviewRequest):
    role_value = payload.role or payload.domain
    if not role_value:
        raise HTTPException(status_code=422, detail="role or domain is required")
    role = _normalize_role(role_value)

    question_bank = None
    try:
        question_bank = db.question_bank.find_one({"role": role})
        if not question_bank:
            question_bank = generate_question_bank(role)
            db.question_bank.insert_one(question_bank)
    except Exception:
        # MongoDB is unavailable; generate questions in memory
        question_bank = generate_question_bank(role)

    questions = _select_questions(question_bank)
    random.shuffle(questions)
    session_id = str(uuid.uuid4())
    session_doc = _create_session_doc(session_id, role, questions, payload.user_id)

    try:
        db.interview_sessions.insert_one(session_doc)
    except Exception:
        # MongoDB unavailable; continue without persistence
        pass

    return {
        "session_id": session_id,
        "questions": questions,
        "state": {"role": role, "session_id": session_id},
    }


@router.post("/evaluate_answer")
def evaluate_answer_route(payload: EvaluateAnswerRequest):
    session = db.interview_sessions.find_one({"session_id": payload.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    score = evaluate_answer(payload.question, payload.answer)
    db.interview_sessions.update_one(
        {"session_id": payload.session_id},
        {"$push": {"answers": payload.answer}, "$set": {"status": "in_progress"}},
    )

    return {"session_id": payload.session_id, "evaluation": score}


@router.post("/final_evaluate")
def final_evaluate_route(payload: FinalEvaluateRequest):
    if len(payload.questions) != len(payload.answers):
        raise HTTPException(status_code=400, detail="Questions and answers must have the same length")

    evaluations = [evaluate_answer(q, a) for q, a in zip(payload.questions, payload.answers)]
    technical_score = _build_consensus(evaluations, "technical_score")
    behavioral_score = _build_consensus(evaluations, "behavioral_score")
    communication_score = _build_consensus(evaluations, "communication_score")
    overall_score = round((technical_score * 0.4) + (behavioral_score * 0.3) + (communication_score * 0.3), 2)

    strengths = _unique_list([item.get("strengths", []) for item in evaluations])
    weaknesses = _unique_list([item.get("weaknesses", []) for item in evaluations])
    recommendations = _unique_list([item.get("suggestions", []) for item in evaluations])

    session_id = payload.session_id or str(uuid.uuid4())
    session_doc = {
        "session_id": session_id,
        "user_id": payload.user_id,
        "role": payload.state.get("role") if payload.state else None,
        "questions": payload.questions,
        "answers": payload.answers,
        "technical_score": technical_score,
        "behavioral_score": behavioral_score,
        "communication_score": communication_score,
        "overall_score": overall_score,
        "status": "completed",
        "createdAt": datetime.utcnow(),
    }
    db.interview_sessions.update_one(
        {"session_id": session_id},
        {"$set": session_doc},
        upsert=True,
    )

    return {
        "session_id": session_id,
        "overall_score": overall_score,
        "technical_score": technical_score,
        "behavioral_score": behavioral_score,
        "communication_score": communication_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
    }
