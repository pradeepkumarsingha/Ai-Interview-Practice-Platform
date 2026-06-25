from datetime import datetime
from pathlib import Path
from typing import Optional
from io import BytesIO

import pdfplumber
from docx import Document
from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from ats_score.predictor import predict_ats
from db import db

router = APIRouter()

# ============================================
# Configuration & Constants
# ============================================
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
    "objective",
}

REQUIRED_SECTIONS = ["education", "skills", "experience"]


# ============================================
# Helper Functions
# ============================================
async def _extract_resume_text(resume: UploadFile) -> str:
    contents = await resume.read()
    suffix = Path(resume.filename or "").suffix.lower()

    # PDF
    if suffix == ".pdf":
        try:
            with pdfplumber.open(BytesIO(contents)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(pages).strip()
        except Exception:
            return ""

    # DOCX
    elif suffix == ".docx":
        try:
            doc = Document(BytesIO(contents))
            return "\n".join(p.text for p in doc.paragraphs).strip()
        except Exception:
            return ""

    # TXT / MD / CSV / JSON
    elif suffix in {".txt", ".md", ".csv", ".json"}:
        try:
            return contents.decode("utf-8").strip()
        except UnicodeDecodeError:
            return contents.decode("latin-1", errors="ignore").strip()

    # Old DOC (unsupported)
    elif suffix == ".doc":
        return ""

    return ""


def validate_resume(filename: str, text: str):
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX resumes are allowed."
        )

    if not text or len(text.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="No readable text found. Please upload a valid resume.",
        )

    words = text.split()
    if len(words) < 50:
        raise HTTPException(
            status_code=400, detail="Resume contains too little information."
        )

    lower = text.lower()

    keyword_count = sum(keyword in lower for keyword in RESUME_KEYWORDS)
    if keyword_count < 2:
        raise HTTPException(
            status_code=400,
            detail="Uploaded document doesn't appear to be a resume.",
        )

    section_count = sum(section in lower for section in REQUIRED_SECTIONS)
    if section_count < 2:
        raise HTTPException(
            status_code=400,
            detail="Resume is missing important sections like Skills, Education or Experience.",
        )


# ============================================
# ATS Score API
# ============================================
@router.post("/ats-score")
@router.post("/ats_score")
async def ats_score(
    resume: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
):
    try:
        # -----------------------------
        # Validate File & Content
        # -----------------------------
        if not resume or not resume.filename:
            raise HTTPException(status_code=400, detail="Please upload a resume.")

        resume_text = await _extract_resume_text(resume)
        
        # Validates file extension, length, and content structure
        validate_resume(resume.filename, resume_text)

        # -----------------------------
        # ATS Prediction
        # -----------------------------
        try:
            result = predict_ats(
                resume_text,
                job_description or "",
                0,
                0,
                0,
                0.0,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"ATS analysis failed: {str(e)}"
            )

        # -----------------------------
        # Save Result
        # -----------------------------
        if user_id:
            try:
                db.ats_results.insert_one(
                    {
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
                    }
                )
            except Exception:
                # Database failure should not stall the user's immediate response
                pass

        # -----------------------------
        # Success Response
        # -----------------------------
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
        raise HTTPException(
            status_code=500, detail=f"Unexpected server error: {str(e)}"
        )

