import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AIInterview from "./pages/AiInterview";
import DigitalTwin from "./pages/DigitalTwin";
import ATSScorePage from "./pages/ATSScore";
import RoleRecommender from "./pages/RoleRecommender";
import Loader from "./components/Loader";
import InterviewPreview from "./components/InterviewPreview";
import AdminPanel from "./pages/AdminPanel";
import LiveInterviewPage from "./pages/LiveinterviewPage";
import InterviewRoom from "./pages/InterviewRoom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // check login status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) return <Loader text="Loading your experience..." />;

  const ProtectedRoute = ({ element }) => isLoggedIn ? element : <Navigate to="/login" />;
  const AdminRoute = ({ element }) => {
    const role = localStorage.getItem("role");
    if (!isLoggedIn) return <Navigate to="/login" />;
    return role === "admin" ? element : <Navigate to="/dashboard" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/interview-preview" element={<InterviewPreview />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />} />
        <Route path="/ai-interview" element={<ProtectedRoute element={<AIInterview />} />} />
        <Route path="/live-interview" element={<ProtectedRoute element={<LiveInterviewPage />} />} />
        <Route path="/live-interview/:meetingId" element={<ProtectedRoute element={<LiveInterviewPage />} />} />
        <Route path="/interview-room/:meetingId" element={<ProtectedRoute element={<InterviewRoom />} />} />
        <Route path="/digital-twin" element={<ProtectedRoute element={<DigitalTwin />} />} />
        <Route path="/role-recommender" element={<ProtectedRoute element={<RoleRecommender />} />} />
        <Route path="/ats-score" element={<ProtectedRoute element={<ATSScorePage />} />} />
        <Route path="/admin" element={<AdminRoute element={<AdminPanel />} />} />
      </Routes>
    </BrowserRouter>
  );
}
  
export default App;
