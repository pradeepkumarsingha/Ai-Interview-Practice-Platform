import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CalendarClock, CheckCircle2, Clock, AlertCircle, XCircle,
  Video, Mic, FileText, ChevronRight, Loader2, RefreshCw
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import axios from "../api/axiosInstance";

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
    desc: "Your request is waiting for an admin to review and assign an interviewer.",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    desc: "Your interview has been approved! Click 'Join Room' to enter.",
  },
  scheduled: {
    label: "Scheduled",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: <CalendarClock className="w-4 h-4" />,
    desc: "Your interview has been scheduled. Check the date and time below.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    desc: "Your request was not approved this time. You may submit a new request.",
  },
  completed: {
    label: "Completed",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
    desc: "This interview session has been completed. View your feedback below.",
  },
};

const DOMAINS = [
  "Full Stack Development",
  "Frontend Development",
  "Backend Development",
  "Data Science",
  "AI / ML Engineering",
  "DevOps & Cloud",
  "Mobile Development",
  "UI/UX Design",
  "System Design",
  "HR / Behavioral",
];

const LiveInterviewPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    domain: "Full Stack Development",
    experienceLevel: "Beginner",
    skills: "",
    preferredDate: "",
    preferredTime: "",
  });

  const fetchRequest = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get("/ai/request-live-interview");
      setRequest(res.data.request || null);
    } catch (err) {
      if (!silent) setError("Could not load interview status.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  // If a meetingId is in the URL, redirect to the WebRTC room immediately
  useEffect(() => {
    if (meetingId) {
      navigate(`/interview-room/${meetingId}`);
    }
  }, [meetingId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        domain: form.domain,
        experienceLevel: form.experienceLevel,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
      };
      await axios.post("/ai/request-live-interview", payload);
      setSuccess("Your interview request has been submitted! An admin will review it shortly.");
      fetchRequest(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = request ? STATUS_CONFIG[request.status] || STATUS_CONFIG.pending : null;

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Page Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">Live Interview</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Human-Led Interviews</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Request a real-time video interview with an expert. Track status and join your session below.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Video className="w-5 h-5 text-indigo-600" />, label: "HD Video + Audio", desc: "Crystal-clear peer-to-peer calls" },
            { icon: <FileText className="w-5 h-5 text-violet-600" />, label: "Resume Sharing", desc: "Interviewer sees your resume live" },
            { icon: <Mic className="w-5 h-5 text-emerald-600" />, label: "AI Feedback", desc: "Speech & confidence analysis post-interview" },
          ].map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">{f.icon}</div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{f.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : request && request.status !== "rejected" && request.status !== "completed" ? (
          // ── Existing Request Status Card ──
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Your Interview Request</h2>
              <button
                onClick={() => fetchRequest(true)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">{statusInfo.desc}</p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Domain</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{request.domain}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Experience</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{request.experienceLevel}</p>
                </div>
                {request.scheduledAt && (
                  <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 col-span-2">
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Scheduled At</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {new Date(request.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Join Room Button */}
              {(request.status === "approved" || request.status === "scheduled") && request.meetingId && (
                <button
                  onClick={() => navigate(`/interview-room/${request.meetingId}`)}
                  className="flex items-center gap-2 w-full justify-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                  <Video className="w-5 h-5" />
                  Join Interview Room
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Admin Remarks */}
              {request.adminRemarks && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1">Admin Note:</p>
                  <p>{request.adminRemarks}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // ── Request Form ──
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                {request?.status === "rejected" || request?.status === "completed"
                  ? "Submit a New Request"
                  : "Request a Live Interview"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Fill in the form below and an admin will match you with an expert.</p>
            </div>

            {request?.status === "rejected" && (
              <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Your previous request was rejected{request.rejectionReason ? `: "${request.rejectionReason}"` : ""}. You may submit a new one.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interview Domain *</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    required
                  >
                    {DOMAINS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Experience Level *</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    required
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Key Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, MongoDB"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preferred Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={form.preferredDate}
                    onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preferred Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={form.preferredTime}
                    onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 transition-all duration-200"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Video className="w-4 h-4" /> Request Live Interview</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default LiveInterviewPage;
