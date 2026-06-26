@echo off
REM Start the AI service on port 5000 so it does not conflict with the backend.
if exist venv\Scripts\activate.bat (
  call venv\Scripts\activate.bat
) else (
  echo No Python virtual environment found in ai_service\venv.
  echo Create one with: python -m venv venv
)
set AI_SERVICE_PORT=5000
python main.py
pause
