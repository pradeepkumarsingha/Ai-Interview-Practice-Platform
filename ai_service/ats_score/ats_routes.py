from datetime import datetime
from pathlib import Path
from typing import Optional
from io import BytesIO

import pdfplumber
from docx import Document
from fastapi import APIRouter, File, Form, UploadFile

from ats_score.predictor import predict_ats
from db import db

router = APIRouter()


async def _extract_resume_text(resume: UploadFile) -> str:
    contents = await resume.read()
    suffix = Path(resume.filename or "").suffix.lower()

    if suffix == ".pdf":
        try:
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

    # Fallback for unsupported file types or .doc
    try:
        return contents.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


@router.post("/ats-score")
@router.post("/ats_score")
async def ats_score(
    resume: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
):
    resume_text = await _extract_resume_text(resume)

    if not resume_text:
        return {
            "ats_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "recommendations": [
                "Unable to extract resume text. Please upload a valid PDF, DOCX, or TXT resume."
            ],
        }

    result = predict_ats(
        resume_text,
        job_description or "",
        0,
        0,
        0,
        0.0,
    )

    if user_id:
        db.ats_results.insert_one({
            "user_id": user_id,
            "resume_skills": resume_text,
            "jd_skills": job_description or "",
            "projects": 0,
            "internships": 0,
            "certifications": 0,
            "cgpa": 0.0,
            "ats_score": result.get("ats_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "recommendations": result.get("recommendations", []),
            "createdAt": datetime.utcnow(),
        })

    return result