import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skills: "",
    experienceLevel: "Beginner",
    targetRole: "",
    preferredDomain: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await axios.post("/auth/register", payload);
      setMessage("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white outline-none transition-all duration-300";
  const selectClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white outline-none transition-all duration-300 bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl" />
      </div>
      <div className="max-w-md mx-auto relative">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white items-center justify-center text-xl font-bold mb-4 shadow-md">AI</div>
              <h1 className="text-2xl font-bold text-slate-800">Create account</h1>
              <p className="text-slate-500 mt-1">Join AI Career Portal and start practicing</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g. React, Node.js"
                  value={form.skills}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target role</label>
                <input
                  type="text"
                  name="targetRole"
                  placeholder="e.g. Data Scientist"
                  value={form.targetRole}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred domain</label>
                <input
                  type="text"
                  name="preferredDomain"
                  placeholder="e.g. Python, Frontend"
                  value={form.preferredDomain}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
              >
                {loading ? "Creating account…" : "Sign up"}
              </button>
            </form>

            {message && <p className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center">{message}</p>}
            {error && <p className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center">{error}</p>}

            <p className="mt-6 text-center text-slate-600 text-sm">
              Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
