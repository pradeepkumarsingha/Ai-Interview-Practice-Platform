from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from io import BytesIO

import pdfplumber
from docx import Document
from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from db import db
from role_recommender.predictor import predict_roles

router = APIRouter()

# ============================================
# Validation Constants
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
# Pydantic Schemas (For pure JSON Requests)
# ============================================
class Candidate(BaseModel):
    skills: str
    projects: int
    internships: int
    certifications: int
    cgpa: float
    user_id: Optional[str] = None


class ResumeInput(BaseModel):
    resume_text: str
    user_id: Optional[str] = None


# ============================================
# Core Extraction & Validation Logic
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
# Role Recommender API
# ============================================
@router.post("/predict-role")
async def predict_role(
    request: Request,
    resume: Optional[UploadFile] = File(None),
    user_id: Optional[str] = Form(None),
    projects: int = Form(0),
    internships: int = Form(0),
    certifications: int = Form(0),
    cgpa: float = Form(0.0),
):
    """
    Accepts either:
    1. A multipart form-data upload containing a file (`resume`) along with metric fields.
    2. A full Candidate JSON payload.
    3. A simple JSON payload with `resume_text`.
    """
    try:
        if resume is not None and resume.filename:
            # 1. Handle file upload scenario
            skills = await _extract_resume_text(resume)
            
            # Run your structural resume validation rules
            validate_resume(resume.filename, skills)

        else:
            # 2 & 3. Handle JSON payload scenario when no file is uploaded
            body: Dict[str, Any] = await request.json()
            
            if "resume_text" in body:
                # Simple text payload scenario
                skills = body.get("resume_text", "")
                projects = internships = certifications = 0
                cgpa = 0.0
                user_id = body.get("user_id")
            else:
                # Full Candidate structured JSON payload scenario
                candidate = Candidate(**body)
                skills = candidate.skills
                projects = candidate.projects
                internships = candidate.internships
                certifications = candidate.certifications
                cgpa = candidate.cgpa
                user_id = candidate.user_id

            # Treat JSON inputs as virtual `.pdf` files to validate text content logic
            validate_resume("resume.pdf", skills)

        # -----------------------------
        # Predict Recommended Roles
        # -----------------------------
        try:
            roles = predict_roles(
                skills,
                projects,
                internships,
                certifications,
                cgpa,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Role prediction failed: {str(e)}"
            )

        response = {"recommended_roles": roles}

        # -----------------------------
        # Save Result
        # -----------------------------
        if user_id:
            try:
                db.role_recommender_results.insert_one({
                    "user_id": user_id,
                    "skills": skills,
                    "projects": projects,
                    "internships": internships,
                    "certifications": certifications,
                    "cgpa": cgpa,
                    "recommended_roles": roles,
                    "createdAt": datetime.utcnow(),
                })
            except Exception:
                # DB failures should not stall user response delivery
                pass

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Unexpected server error: {str(e)}"
        )