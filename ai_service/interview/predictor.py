import json
import os
import random
from datetime import datetime
from typing import Any, Dict, List, Optional

try:
    from groq import Groq
except ImportError:
    Groq = None

MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def _get_groq_api_key():
    return os.getenv("GROQ_API_KEY")


def _get_groq_client():
    api_key = _get_groq_api_key()
    if api_key and Groq is not None:
        return Groq(api_key=api_key)
    return None


def _clean_json_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```") and cleaned.endswith("```"):
        cleaned = "\n".join(cleaned.splitlines()[1:-1])
    return cleaned


def _parse_groq_json(text: str) -> Dict[str, Any]:
    cleaned = _clean_json_text(text)
    return json.loads(cleaned)


def _fallback_question_bank(role: str) -> Dict[str, Any]:
    role_label = role.strip() or "Target Role"
    return {
        "role": role_label,
        "introduction": [
            f"Tell me about your journey to becoming a {role_label}.",
            f"Walk me through one project where you built a solution for {role_label} work.",
            f"What motivates you most about working as a {role_label}?",
            f"Describe how you stay current with {role_label}-related tools and trends.",
            f"Explain your most meaningful achievement in a {role_label} context."
        ],
        "technical": [
            f"Explain the most important data structure you used in a {role_label} project.",
            f"How do you debug a technical failure in a {role_label} system?",
            f"Describe a time you optimized performance for a {role_label} workflow.",
            f"What is your approach to designing scalable solutions for {role_label} problems?",
            f"How do you keep security and reliability in mind for {role_label} systems?",
            f"Explain a technical trade-off you made on a recent {role_label} assignment.",
            f"How do you use metrics to measure success as a {role_label}?",
            f"Describe how you would build an API or service in a {role_label} environment.",
            f"What automation tools do you rely on for {role_label} work?",
            f"Explain a technical architecture pattern that suits {role_label} projects."
        ],
        "scenario": [
            f"Share an example of a time you resolved a complex production issue as a {role_label}.",
            f"Describe how you handled a shifting deadline on a {role_label} project.",
            f"Tell me about a challenge you solved with minimal resources in a {role_label} role.",
            f"How would you prioritize competing demands on a {role_label} project?",
            f"Explain how you collaborated with cross-functional teams on a {role_label} delivery.",
            f"What would you do if you discovered a critical bug days before launch?",
            f"Describe a time you converted ambiguous requirements into a working {role_label} solution.",
            f"How do you manage changing stakeholder expectations in a {role_label} project?",
            f"Tell me about a time you learned quickly to support a new {role_label} initiative.",
            f"Explain how you handled a difficult handoff with another team during a {role_label} sprint."
        ],
        "behavioral": [
            f"Describe a time you received tough feedback and how you responded as a {role_label}.",
            f"How do you balance user empathy and technical constraints in a {role_label} role?",
            f"Tell me about a time when collaboration made a {role_label} outcome better.",
            f"How do you manage stress during high-pressure periods as a {role_label}?",
            f"Share an example of when you had to adapt your approach quickly in a {role_label} setting."
        ],
        "hr": [
            f"Why do you want to work as a {role_label}?",
            f"What are your long-term goals in a {role_label} career?",
            f"How do you stay motivated when a {role_label} challenge isn’t exciting?",
            f"What strengths do you bring to a {role_label} team?",
            f"Tell us about a time you had to navigate a difficult work relationship as a {role_label}."
        ],
        "generatedBy": "Groq",
        "createdAt": datetime.utcnow()
    }


def _build_groq_prompt(role: str) -> str:
    return (
        f"Generate a JSON object for a {role} question bank. "
        "The object must contain introduction, technical, scenario, behavioral, and hr arrays. "
        "Each array must have exactly the requested number of questions. "
        "Do not include any explanation or markdown. "
        "Return valid JSON only. "
        "Use the following structure: {\n  \"role\": \"...\", \"introduction\": [...], "
        "\"technical\": [...], \"scenario\": [...], \"behavioral\": [...], \"\"hr\": [...], \"generatedBy\": \"Groq\", \"createdAt\": \"<ISO>\"\n}"
    )


def generate_question_bank(role: str) -> Dict[str, Any]:
    role_label = role.strip() or "Target Role"
    client = _get_groq_client()
    if client:
        try:
            prompt = _build_groq_prompt(role_label)
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a professional interview question generator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
            )
            raw = response.choices[0].message.content.strip()
            data = _parse_groq_json(raw)
            data["createdAt"] = datetime.utcnow()
            data["generatedBy"] = "Groq"
            data["role"] = role_label
            return data
        except Exception:
            pass

    payload = _fallback_question_bank(role_label)
    return payload


def evaluate_answer(question: str, answer: str) -> Dict[str, Any]:
    client = _get_groq_client()
    if client:
        try:
            prompt = (
                "Evaluate the candidate's answer for the following question. "
                "Respond with valid JSON only, containing technical_score, behavioral_score, communication_score, strengths, weaknesses, and suggestions. "
                "Scores must be integers between 0 and 100.\n"
                f"Question: {question}\nAnswer: {answer}"
            )
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are an objective interview evaluator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
            )
            raw = response.choices[0].message.content.strip()
            data = _parse_groq_json(raw)
            return {
                "technical_score": int(data.get("technical_score", 0)),
                "behavioral_score": int(data.get("behavioral_score", 0)),
                "communication_score": int(data.get("communication_score", 0)),
                "strengths": data.get("strengths") or [],
                "weaknesses": data.get("weaknesses") or [],
                "suggestions": data.get("suggestions") or []
            }
        except Exception:
            pass

    word_count = max(len(answer.split()), 1)
    base_score = min(100, word_count * 4)
    technical = min(100, max(40, base_score - 10))
    behavioral = min(100, max(40, base_score - 20))
    communication = min(100, max(40, base_score - 15))
    strengths = ["Good structure" if len(answer.split()) > 20 else "Clear intent"]
    weaknesses = ["More detail is needed" if len(answer.split()) < 30 else "Refine your examples"]
    suggestions = ["Provide a more concise summary of the outcome.", "Use specific metrics when possible."]
    return {
        "technical_score": technical,
        "behavioral_score": behavioral,
        "communication_score": communication,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
    }
