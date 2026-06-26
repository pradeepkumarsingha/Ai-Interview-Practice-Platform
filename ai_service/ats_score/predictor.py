import joblib
import re
import numpy as np
from scipy.sparse import hstack
from pathlib import Path
MODEL_PATH = BASE_DIR /model/ "ats_model.pkl"
TFIDF_PATH = BASE_DIR /model/ "ats_tfidf.pkl"

COMMON_SKILLS = [
    "python", "java", "javascript", "machine learning", "sql", "cloud", "aws", "azure", "docker",
    "kubernetes", "react", "node", "node.js", "api", "data analysis", "project management", "communication",
    "team", "git", "testing", "automation", "linux", "tableau", "tensorflow", "pytorch", "django",
    "flask", "fastapi", "postgresql", "mongodb", "devops", "microservices", "frontend", "backend",
    "full stack", "leadership", "analytics", "cybersecurity", "quality assurance", "business intelligence"
]

FALLBACK_JD_SKILLS = {
    "python", "java", "machine learning", "sql", "cloud", "aws", "docker", "react", "node", "api",
    "data analysis", "project management", "communication", "team", "git", "testing", "automation"
}

METRIC_PATTERNS = re.compile(r"\b(\d+%|\d+\+|increased|decreased|reduced|improved|boosted|saved|achieved|delivered|optimized)\b")
SUMMARY_PATTERNS = ["professional summary", "career summary", "summary", "objective"]
SKILLS_SECTION_PATTERNS = ["technical skills", "skills", "expertise", "tools"]


def _normalize(text):
    return text.lower() if isinstance(text, str) else ""


def _extract_skills(text):
    normalized = _normalize(text)
    found = set()

    for skill in COMMON_SKILLS:
        if skill in normalized:
            found.add(skill.replace("node.js", "node"))

    if "ml" in normalized and "machine learning" not in found:
        found.add("machine learning")

    return sorted(found)


def _has_section(text, patterns):
    normalized = _normalize(text)
    return any(pattern in normalized for pattern in patterns)


def _has_metrics(text):
    return bool(METRIC_PATTERNS.search(_normalize(text)))


def predict_ats(
    resume_skills,
    jd_skills,
    projects,
    internships,
    certifications,
    cgpa
):

    combined_text = resume_skills + " [SEP] " + jd_skills
    X_text = tfidf.transform([combined_text])

    X_num = np.array([
        [
            projects,
            internships,
            certifications,
            cgpa
        ]
    ])

    X = hstack([X_text, X_num])
    ats_score = round(float(model.predict(X)[0]), 2)

    resume_text = _normalize(resume_skills)
    resume_skills_list = _extract_skills(resume_text)
    resume_set = set(resume_skills_list)

    if jd_skills and jd_skills.strip():
        jd_set = set(_extract_skills(jd_skills)) or FALLBACK_JD_SKILLS
    else:
        jd_set = FALLBACK_JD_SKILLS

    matched_skills = sorted(resume_set.intersection(jd_set))
    missing_skills = sorted(jd_set - resume_set)

    strengths = []
    if resume_skills_list:
        skills_preview = ", ".join(resume_skills_list[:4])
        strengths.append(f"Strong coverage of {skills_preview} keywords.")

    if _has_section(resume_text, SUMMARY_PATTERNS):
        strengths.append("Clear career summary section.")

    if _has_section(resume_text, SKILLS_SECTION_PATTERNS):
        strengths.append("Dedicated skills section with relevant tools and technologies.")

    if _has_metrics(resume_text):
        strengths.append("Quantified achievements with measurable outcomes.")

    if not strengths:
        strengths = [
            "Clear section structure.",
            "Solid technical vocabulary.",
            "Well-formatted experience entries."
        ]

    suggestions = []
    if not _has_section(resume_text, SUMMARY_PATTERNS):
        suggestions.append("Add a concise career summary at the top to highlight your target role and strengths.")

    if not _has_metrics(resume_text):
        suggestions.append("Use quantifiable metrics to describe achievements, such as percentages, dollar amounts, or time saved.")

    if not _has_section(resume_text, SKILLS_SECTION_PATTERNS):
        suggestions.append("Include a dedicated skills section listing tools, frameworks, and platforms.")

    for skill in missing_skills[:5]:
        suggestions.append(f"Show relevant experience with {skill} in your accomplishments.")

    if not suggestions:
        suggestions = [
            "Add measurable outcomes for your projects.",
            "Include specific tools, frameworks, and methodologies used.",
            "Use action-oriented language to describe your experience."
        ]

    weaknesses = missing_skills[:5] if missing_skills else [
        "Measurable project impact",
        "Relevant technical keywords",
        "Clear skill section"
    ]

    return {
        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
        "suggestions": suggestions,
        "weaknesses": weaknesses,
        "recommendations": suggestions
    }