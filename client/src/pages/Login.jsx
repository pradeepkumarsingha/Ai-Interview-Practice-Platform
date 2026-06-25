import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const Login = ({ setIsLoggedIn }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", form);
      const userData = res.data.user || res.data;
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userData.role || "user");
      setIsLoggedIn(true);
      if (userData.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white items-center justify-center text-xl font-bold mb-4 shadow-md">AI</div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
              <p className="text-slate-500 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white outline-none transition-all duration-300"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white outline-none transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {error && (
              <p className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center">{error}</p>
            )}

            <p className="mt-6 text-center text-slate-600 text-sm">
              Don’t have an account?{" "}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
