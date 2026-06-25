# 🚀 AI Career Portal

An end-to-end AI-powered career development platform that helps users improve their resumes, practice interviews, and receive intelligent role recommendations.

Built with a modern microservice architecture using:

- ⚛️ React (Vite)
- 🟢 Node.js + Express
- 🐍 Flask (AI Microservice)
- 🗄 MongoDB
- 🤖 Gemini API
- 📊 Machine Learning (Scikit-learn)

---

## ✨ Features

### 📄 ATS Resume Scoring
- Upload resume (PDF/DOCX/TXT)
- AI-powered ATS compatibility score
- Strengths & improvement suggestions
- Smart fallback system if AI fails

### 🎤 AI Interview Practice
- Domain-based interview generation
- Technical + Coding + Behavioral questions
- 60-second timer per question
- AI-based final evaluation
- Average score + structured feedback
- Suggestions for improvement

### 🎯 Role Recommender
- Paste resume/profile description
- ML-based role prediction
- Skill-gap analysis
- Personalized career suggestions

### 📊 Dashboard
- Interview history tracking
- Performance insights
- Activity summary

### 🛠 Admin Panel
- Manage interview questions
- Admin authentication
- Question management system

---

## 🏗 System Architecture
```
React (Frontend)
↓
Node.js Backend (Express + MongoDB)
↓
Python AI Service (Flask + Gemini + ML Models)
```

This separation ensures:
- Scalability
- Clean architecture
- Fault tolerance (AI fallback)
- Easier deployment

---

## 📁 Project Structure

```
AI_Career_Portal_Backend_v2
│
├── ai_service/ # Python AI microservice
│ ├── ai_models/ # ML trained models
│ ├── uploads/ # Resume uploads
│ ├── app.py # Flask API
│ └── requirements.txt
│
├── backend/ # Node.js server
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── uploads/
│ └── server.js
│
├── client/ # React frontend (Vite)
│ ├── components/
│ ├── pages/
│ ├── styles/
│ └── App.jsx
│
└── README.md
```

<<<<<<< HEAD
=======
Structure:
- backend/         (Node Express app, runs on port 8000)
- ai_service/      (Flask AI service, runs on port 5000)
  - ai_models/     (place your .pkl models here: ai_role_recommender.pkl, vectorizer.pkl, ats.pkl)

Run AI service:
$ cd ai_service
$ python -m venv venv
$ venv\Scripts\activate    # on Windows
$ pip install -r requirements.txt
$ python run.py

Or run directly with uvicorn on port 5000:
$ cd ai_service
$ python -m uvicorn main:app --reload --port 5000

Run Node backend:
$ cd backend
$ npm install
$ npm run dev   # starts on PORT from .env (8000)

Notes:
- Backend calls AI service at AI_SERVICE_URL=http://127.0.0.1:5000
- Do not run the AI service on port 8000, because the backend also uses 8000.
- There is a helper batch file at ai_service\start_ai_service.bat to activate venv and start on 5000.
>>>>>>> 3d8503b (development Success)
