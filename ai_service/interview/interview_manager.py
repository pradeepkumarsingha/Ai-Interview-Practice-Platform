# interview_service/interview_manager.py

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Pulls key cleanly from Environment Settings variables

def _get_groq_api_key():
    return os.getenv("GROQ_API_KEY")


def _get_groq_client():
    api_key = _get_groq_api_key()
    return Groq(api_key=api_key) if api_key else None

# Llama 3.1 8B: Incredible contextual reasoning, high output speed, and 100% free tier
MODEL_NAME = "llama-3.1-8b-instant"

def query_groq_cloud(system_prompt: str, user_message: str, force_json: bool = False) -> str:
    """Dispatches raw requests to the Groq inference engine server layers."""
    client = _get_groq_client()
    if client is None:
        return "Backend Configuration Error: 'GROQ_API_KEY' variable is not declared or Groq client failed to initialize."

    try:
        response_format = {"type": "json_object"} if force_json else None
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            response_format=response_format
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Cloud Connection Interface Failure: {str(e)}"

def generate_interview_step(stage: str, domain: str, chat_history: str, user_input: str = "") -> str:
    """Compiles prompts targeting specific milestones across the workspace pipeline."""
    
    if stage.upper() == "START":
        system_prompt = (
            f"You are a professional HR Recruiter. Start an interview for a {domain} role. "
            f"Greet the candidate warmly, welcome them to the platform, and ask them "
            f"to introduce themselves, briefly stating their experience. "
            f"Do not ask any specific technical questions yet. Keep your response under 3 sentences."
        )
        return query_groq_cloud(system_prompt, "Initiate session.")

    elif stage.upper() == "DOMAIN":
        system_prompt = (
            f"You are a strict technical interviewer evaluating a candidate for a {domain} position. "
            f"Review the conversation history:\n{chat_history}\n\n"
            f"Based on their answer, follow up by asking exactly ONE core technical conceptual question about {domain}. "
            f"Rules: Do not ask multiple questions at once. Keep the tone conversational. Do not provide code blocks."
        )
        return query_groq_cloud(system_prompt, f"User response: {user_input}")

    elif stage.upper() == "BEHAVIORAL":
        system_prompt = (
            f"You are evaluating the behavioral traits of a candidate for a {domain} role. "
            f"Review the conversation history:\n{chat_history}\n\n"
            f"Transition away from technical code. Ask exactly ONE behavioral question modeled after the STAR method framework "
            f"(e.g., managing conflict, tight deadlines, team collaboration). Do not bundle questions."
        )
        return query_groq_cloud(system_prompt, f"User response: {user_input}")

    elif stage.upper() == "EVALUATE":
        system_prompt = (
            "You are a Senior Talent Acquisition Director. Carefully evaluate the complete interview transcript provided below.\n"
            f"Transcript:\n{chat_history}\n\n"
            "Assess technical depth and soft skills. You MUST output your evaluation ONLY as a valid JSON object. "
            "Do not include any intro, filler text, or markdown code blocks (such as ```json). The JSON object should contain the following fields: "
            "{'technical_score': int, 'behavioral_score': int, 'overall_feedback': str, 'recommendation': str}. ")