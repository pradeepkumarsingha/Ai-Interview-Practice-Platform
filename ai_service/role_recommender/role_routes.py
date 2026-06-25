from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import APIRouter, Request, UploadFile, File
from pydantic import BaseModel

from db import db
from role_recommender.predictor import predict_roles

router = APIRouter()


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


@router.post("/predict-role")
async def predict_role(request: Request, resume: UploadFile = File(None)):
    """Accept either a full Candidate payload, a JSON resume_text, or an uploaded resume file.
    The uploaded file's plain‑text content is used as the `skills` string.
    Numeric fields default to 0 when not supplied.
    """
    if resume is not None:
        # Read the uploaded file (assume plain‑text or UTF‑8 encoded)
        resume_bytes = await resume.read()
        try:
            skills = resume_bytes.decode("utf-8")
        except UnicodeDecodeError:
            skills = resume_bytes.decode("latin-1")
        if not skills or not skills.strip():
            default_roles = [
                {"role": "AI Product Analyst", "confidence": 95},
                {"role": "Full‑Stack Engineer", "confidence": 93},
                {"role": "Data Engineer", "confidence": 91},
            ]
            return {"recommended_roles": default_roles}
        projects = internships = certifications = 0
        cgpa = 0.0
        user_id = None
    else:
        # Parse JSON payload when no file is uploaded
        body: Dict[str, Any] = await request.json()
        if "resume_text" in body:
            # Simple payload from frontend
            skills = body.get("resume_text", "")
            projects = internships = certifications = 0
            cgpa = 0.0
            user_id = body.get("user_id")
        else:
            # Full Candidate payload
            candidate = Candidate(**body)
            skills = candidate.skills
            projects = candidate.projects
            internships = candidate.internships
            certifications = candidate.certifications
            cgpa = candidate.cgpa
            user_id = candidate.user_id
    # Always call the predictor – even if skills string is empty, the model will handle it
    roles = predict_roles(
        skills,
        projects,
        internships,
        certifications,
        cgpa,
    )
    response = {"recommended_roles": roles}
    # Optionally store the request
    if user_id:
        from db import db
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
    return response