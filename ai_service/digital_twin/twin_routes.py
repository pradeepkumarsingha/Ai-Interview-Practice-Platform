import re
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Optional, List

from docx import Document
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from ats_score.predictor import predict_ats
from role_recommender.predictor import predict_roles
from db import db

router = APIRouter()


SUMMARY_PATTERNS = [
    "professional summary",
    "career summary",
    "summary",
    "objective",
]

SKILLS_SECTION_PATTERNS = [
    "technical skills",
    "skills",
    "expertise",
    "tools",
]

METRIC_PATTERNS = re.compile(r"\b(\d+%|\d+\+|increased|decreased|reduced|improved|boosted|saved|achieved|delivered|optimized)\b")
COMMON_INTERVIEW_TERMS = {
    "leadership",
    "project",
    "team",
    "communication",
    "python",
    "sql",
    "react",
    "cloud",
    "aws",
    "azure",
    "docker",
    "api",
    "machine learning",
    "data",
    "problem",
    "design",
}

# ---------------- Resume Validation ---------------- #

ALLOWED_FILE_TYPES = {".pdf", ".docx"}

RESUME_KEYWORDS = {
    "education",
    "experience",
    "skills",
    "technical skills",
    "projects",
    "internship",
    "certification",
    "summary",
    "objective"
}

REQUIRED_SECTIONS = [
    "education",
    "skills",
    "experience"
]


def validate_resume(filename: str, text: str):
    suffix = Path(filename).suffix.lower()

    # File type
    if suffix not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resumes are allowed."
        )

    # Empty text
    if not text or len(text.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="No readable text found. Please upload a valid resume."
        )

    words = text.split()

    # Minimum words
    if len(words) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume contains too little information."
        )

    lower = text.lower()

    # Resume keywords
    keyword_count = sum(
        keyword in lower
        for keyword in RESUME_KEYWORDS
    )

    if keyword_count < 2:
        raise HTTPException(
            status_code=400,
            detail="Uploaded document doesn't appear to be a resume."
        )

    # Required sections
    section_count = sum(
        section in lower
        for section in REQUIRED_SECTIONS
    )

    if section_count < 2:
        raise HTTPException(
            status_code=400,
            detail="Resume is missing important sections like Skills, Education or Experience."
        )


class DigitalTwinResponse(BaseModel):
    user_id: Optional[str]
    recommended_role: Optional[str]
    ats_score: float
    ai_interview_score: float
    interview_score: float
    live_interview_score: float
    strengths: List[str]
    weaknesses: List[str]
    career_recommendations: List[str]
    readiness_score: float
    career_readiness_score: float
    updated_at: datetime


def _normalize_score(value: float) -> float:
    return max(0.0, min(100.0, float(value)))


def _compute_readiness(ats_score: float, interview_score: float, live_score: Optional[float]) -> float:
    if live_score is None:
        total_weight = 40 + 40
        return round((ats_score * 40 + interview_score * 40) / total_weight, 2)
    return round(ats_score * 0.4 + interview_score * 0.4 + live_score * 0.2, 2)


def _has_section(text: str, patterns: List[str]) -> bool:
    normalized = text.lower()
    return any(pattern in normalized for pattern in patterns)


def _has_metrics(text: str) -> bool:
    return bool(METRIC_PATTERNS.search(text.lower()))


async def _extract_resume_text(resume: UploadFile) -> str:
    contents = await resume.read()
    suffix = Path(resume.filename or "").suffix.lower()

    if suffix == ".pdf":
        try:
            import pdfplumber
            with pdfplumber.open(BytesIO(contents)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(pages).strip()
        except Exception:
            pass

    if suffix == ".docx":
        try:
            doc = Document(BytesIO(contents))
            return "\n".join([p.text for p in doc.paragraphs]).strip()
        except Exception:
            pass

    if suffix in {".txt", ".md", ".csv", ".json"} or not suffix:
        try:
            return contents.decode("utf-8").strip()
        except UnicodeDecodeError:
            return contents.decode("latin-1", errors="ignore").strip()

    try:
        return contents.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


def _estimate_interview_score(resume_text: str) -> float:
    normalized = resume_text.lower()
    score = 45.0
    score += min(20.0, sum(3.0 for skill in COMMON_INTERVIEW_TERMS if skill in normalized))
    if _has_section(normalized, SUMMARY_PATTERNS):
        score += 6.0
    if _has_section(normalized, SKILLS_SECTION_PATTERNS):
        score += 6.0
    if _has_metrics(normalized):
        score += 8.0
    word_count = max(0, len(normalized.split()))
    score += min(15.0, (word_count // 50) * 2.0)
    return _normalize_score(score)


def _aggregate_strengths(results: dict) -> List[str]:
    strengths = []
    if results.get("interview"):
        strengths.extend(results["interview"].get("strengths", []))
    if results.get("ats"):
        strengths.extend(results["ats"].get("strengths", []))
        strengths.append("Strong ATS keyword match")
    return list({item for item in strengths if item})


def _aggregate_weaknesses(results: dict) -> List[str]:
    weaknesses = []
    if results.get("interview"):
        weaknesses.extend(results["interview"].get("weaknesses", []))
    if results.get("ats"):
        weaknesses.extend(results["ats"].get("missing_skills", []))
    return list({item for item in weaknesses if item})


def _aggregate_recommendations(results: dict, role: Optional[str]) -> List[str]:
    recommendations = []
    if results.get("role"):
        recommended_role = results["role"].get("recommended_roles", [{}])[0].get("role")
        if recommended_role:
            recommendations.append(f"Focus on {recommended_role} career readiness.")
    if results.get("ats"):
        recommendations.extend(results["ats"].get("recommendations", []))
    if results.get("interview"):
        recommendations.extend(results["interview"].get("suggestions", []))
    if role and not results.get("role"):
        recommendations.append(f"Build a stronger case for the {role} role.")
    return list({item for item in recommendations if item})


@router.post("/digital_twin", response_model=DigitalTwinResponse)
async def get_digital_twin(
    user_id: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
):
    resume_text = None
    if resume is not None:
        resume_text = await _extract_resume_text(resume)

        validate_resume(
            resume.filename,
            resume_text
        )

    if not user_id and not role and not resume_text:
        raise HTTPException(status_code=400, detail="user_id, role, or resume is required")

    results = {}
    if user_id:
        results["role"] = db.role_recommender_results.find_one(
            {"user_id": user_id}, sort=[("createdAt", -1)]
        )
        results["ats"] = db.ats_results.find_one(
            {"user_id": user_id}, sort=[("createdAt", -1)]
        )
        results["interview"] = db.interview_sessions.find_one(
            {"user_id": user_id}, sort=[("createdAt", -1)]
        )
        results["live"] = db.live_interview_results.find_one(
            {"user_id": user_id}, sort=[("createdAt", -1)]
        )

    if resume_text and len(resume_text.strip()) > 0:
        if not results.get("role"):
            predicted_roles = predict_roles(resume_text, 0, 0, 0, 0.0)
            results["role"] = {"recommended_roles": predicted_roles}
        ats_result = predict_ats(resume_text, "", 0, 0, 0, 0.0)
        results["ats"] = ats_result
        results["interview"] = {
            "overall_score": _estimate_interview_score(resume_text),
            "strengths": [
                "Strong resume structure and keyword coverage." if ats_result.get("strengths") else "Clear resume narrative.",
            ],
            "weaknesses": ats_result.get("weaknesses", []),
            "suggestions": [
                *ats_result.get("suggestions", []),
                "Practice storytelling for interview questions.",
                "Highlight accomplishments with metrics and outcomes.",
            ],
        }

    recommended_role = None
    ats_score = 0.0
    ai_interview_score = 0.0
    live_interview_score = None

    if results.get("role"):
        recommended_role = results["role"].get("recommended_roles", [{}])[0].get("role")
    if results.get("ats"):
        ats_score = float(results["ats"].get("ats_score", 0.0))
    if results.get("interview"):
        ai_interview_score = float(results["interview"].get("overall_score", 0.0))
    if results.get("live"):
        live_interview_score = float(results["live"].get("overall_score", 0.0))

    if not recommended_role and role:
        recommended_role = role

    readiness_score = _compute_readiness(ats_score, ai_interview_score, live_interview_score)
    if live_interview_score is None:
        live_interview_score = 0.0

    response = {
        "user_id": user_id,
        "recommended_role": recommended_role or "Undetermined",
        "ats_score": _normalize_score(ats_score),
        "ai_interview_score": _normalize_score(ai_interview_score),
        "interview_score": _normalize_score(ai_interview_score),
        "live_interview_score": _normalize_score(live_interview_score),
        "strengths": _aggregate_strengths(results),
        "weaknesses": _aggregate_weaknesses(results),
        "career_recommendations": _aggregate_recommendations(results, role),
        "readiness_score": _normalize_score(readiness_score),
        "career_readiness_score": _normalize_score(readiness_score),
        "updated_at": datetime.utcnow(),
    }

    if user_id:
        db.digital_twin.update_one(
            {"user_id": user_id},
            {"$set": {
                "recommended_role": response["recommended_role"],
                "ats_score": response["ats_score"],
                "ai_interview_score": response["ai_interview_score"],
                "interview_score": response["interview_score"],
                "live_interview_score": response["live_interview_score"],
                "strengths": response["strengths"],
                "weaknesses": response["weaknesses"],
                "career_recommendations": response["career_recommendations"],
                "readiness_score": response["readiness_score"],
                "career_readiness_score": response["career_readiness_score"],
                "updated_at": response["updated_at"],
            }},
            upsert=True,
        )

    return response
