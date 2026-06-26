import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from io import BytesIO

import pdfplumber
from docx import Document
from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from ats_score.predictor import predict_ats
from db import db

router = APIRouter()

ALLOWED_FILE_TYPES = {".pdf", ".docx"}

RESUME_KEYWORDS = {
    "education", "experience", "skills", "technical skills", 
    "projects", "internship", "certification", "summary", "objective"
}

REQUIRED_SECTIONS = ["education", "skills", "experience"]


async def _extract_resume_text(resume: UploadFile) -> str:
    suffix = Path(resume.filename or "").suffix.lower()
    try:
        contents = await resume.read()
        buffer = BytesIO(contents)

        if suffix == ".pdf":
            with pdfplumber.open(buffer) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages).strip()

        elif suffix == ".docx":
            doc = Document(buffer)
            return "\n".join(p.text for p in doc.paragraphs if p.text).strip()

        elif suffix in {".txt", ".md", ".csv", ".json"}:
            try:
                return contents.decode("utf-8").strip()
            except UnicodeDecodeError:
                return contents.decode("latin-1", errors="ignore").strip()
    except Exception as e:
        print(f"[ERROR] Text extraction failed: {e}")
        return ""
    finally:
        await resume.close()
    return ""


def validate_resume(filename: str, text: str):
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX resumes are allowed.")
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="No readable text found.")
    if len(text.split()) < 50:
        raise HTTPException(status_code=400, detail="Resume contains too little information.")
    
    lower = text.lower()
    if sum(keyword in lower for keyword in RESUME_KEYWORDS) < 2:
        raise HTTPException(status_code=400, detail="Document doesn't appear to be a resume.")
    if sum(section in lower for section in REQUIRED_SECTIONS) < 2:
        raise HTTPException(status_code=400, detail="Resume is missing core required sections.")


# ====================================================================
# Core Execution Logic
# ====================================================================
async def core_ats_processing(resume: UploadFile, user_id: Optional[str], job_description: Optional[str]):
    try:
        resume_text = await _extract_resume_text(resume)
        validate_resume(resume.filename or "", resume_text)

        # Execute ML model pipeline
        try:
            result = predict_ats(
                resume_text,
                job_description or "",
                0, 0, 0, 0.0
            )
        except Exception as model_err:
            raise HTTPException(status_code=500, detail=f"Model Prediction Error: {str(model_err)}")

        # Log payload to database if user context exists
        if user_id:
            try:
                db.ats_results.insert_one({
                    "user_id": user_id,
                    "resume_skills": resume_text,
                    "jd_skills": job_description or "",
                    "projects": 0, "internships": 0, "certifications": 0, "cgpa": 0.0,
                    "ats_score": result.get("ats_score", 0),
                    "matched_skills": result.get("matched_skills", []),
                    "missing_skills": result.get("missing_skills", []),
                    "recommendations": result.get("recommendations", []),
                    "createdAt": datetime.now(timezone.utc),
                })
            except Exception as db_err:
                print(f"[WARN] Database logging error: {db_err}")

        return {
            "success": True,
            "ats_score": result.get("ats_score", 0),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "recommendations": result.get("recommendations", []),
        }

    except HTTPException:
        raise
    except Exception as e:
        print("\n=== CRITICAL BACKEND CRASH TRACEBACK ===")
        traceback.print_exc()
        print("========================================\n")
        raise HTTPException(status_code=500, detail=f"Internal service error: {str(e)}")


# ====================================================================
# Target Route Directives (Explicitly satisfies the Node Gateway URL)
# ====================================================================
@router.post("/ats_score")
async def ats_score_underscore(
    resume: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
):
    return await core_ats_processing(resume, user_id, job_description)


@router.post("/ats-score")
async def ats_score_hyphen(
    resume: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
):
    return await core_ats_processing(resume, user_id, job_description)