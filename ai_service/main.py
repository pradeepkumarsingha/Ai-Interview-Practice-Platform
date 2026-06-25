import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from role_recommender.role_routes import router as role_router
from ats_score.ats_routes import router as ats_router
from interview.interview_routes import router as interview_router
from digital_twin.twin_routes import router as digital_twin_router

app = FastAPI(
    title="CareerAI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(role_router)

app.include_router(ats_router)
app.include_router(interview_router)
app.include_router(digital_twin_router)

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("AI_SERVICE_PORT", 5000))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
