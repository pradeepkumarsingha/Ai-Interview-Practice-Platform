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

