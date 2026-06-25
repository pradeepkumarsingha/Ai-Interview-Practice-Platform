# interview_service/database.py

# Simulated In-Memory Database for state-tracking sessions
# In production, you can easily map these fields to PostgreSQL or SQLAlchemy schemas
INTERVIEW_DB = {}

def create_interview_session(interview_id: str, domain: str) -> dict:
    """Initializes a new isolated interview tracking profile."""
    INTERVIEW_DB[interview_id] = {
        "id": interview_id,
        "domain": domain,
        "current_stage": "START",      # Lifecycle: START -> DOMAIN -> BEHAVIORAL -> EVALUATE -> COMPLETED
        "question_count": 0,          # Tracks question rounds
        "chat_history": ""            # Appends all dialogue exchanges chronologically
    }
    return INTERVIEW_DB[interview_id]

def get_interview_session(interview_id: str) -> dict:
    """Fetches an active ongoing session profile wrapper safely."""
    return INTERVIEW_DB.get(interview_id)

def update_interview_session(interview_id: str, updates: dict) -> dict:
    """Updates internal state fields dynamically inside database memory."""
    if interview_id in INTERVIEW_DB:
        INTERVIEW_DB[interview_id].update(updates)
        return INTERVIEW_DB[interview_id]
    return None