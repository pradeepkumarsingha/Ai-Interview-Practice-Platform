import React, { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Edit3, ExternalLink, RefreshCw, Trash2, Users, Video, FileText, Gauge, ShieldCheck, X } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import QuestionForm from "../components/QuestionsForm";
import { Card, PageHeader, SecondaryButton, StatTile } from "../components/ui";
import axios from "../api/axiosInstance";

const readinessDistribution = [
  { label: "0-40", value: 18, color: "#ef4444" },
  { label: "41-60", value: 34, color: "#f97316" },
  { label: "61-80", value: 52, color: "#4f46e5" },
  { label: "81-100", value: 29, color: "#10b981" },
];

const AdminPanel = () => {
  const [questions, setQuestions] = useState([]);
  const [pendingInterviews, setPendingInterviews] = useState([]);
  const [approvedInterviews, setApprovedInterviews] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [interviewsError, setInterviewsError] = useState("");
  const [approvingId, setApprovingId] = useState("");
  const [rejectingId, setRejectingId] = useState("");

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get("/admin/questions");
      setQuestions(Array.isArray(res.data) ? res.data : res.data.questions || res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  const fetchLiveInterviews = useCallback(async () => {
    try {
      setInterviewsLoading(true);
      setInterviewsError("");
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get("/admin/interviews?status=pending"),
        axios.get("/admin/interviews?status=approved"),
      ]);
      setPendingInterviews(Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data.data || []);
      setApprovedInterviews(Array.isArray(approvedRes.data) ? approvedRes.data : approvedRes.data.data || []);
    } catch {
      setInterviewsError("Failed to load interview requests.");
    } finally {
      setInterviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchLiveInterviews();
  }, [fetchQuestions, fetchLiveInterviews]);

  const handleApproveInterview = async (requestId) => {
    try {
      setApprovingId(requestId);
      await axios.put(`/admin/interviews/${requestId}/approve`);
      await fetchLiveInterviews();
    } catch {
      alert("Failed to approve interview request.");
    } finally {
      setApprovingId("");
    }
  };

  const handleRejectInterview = async (requestId) => {
    const reason = window.prompt("Rejection reason (optional):") || "Admin decision";
    try {
      setRejectingId(requestId);
      await axios.put(`/admin/interviews/${requestId}/reject`, { rejectionReason: reason });
      fetchLiveInterviews();
    } catch {
      alert("Failed to reject interview request.");
    } finally {
      setRejectingId("");
    }
  };

  const handleSaveQuestion = async (formData) => {
    try {
      if (editingQuestion) {
        await axios.put(`/admin/questions/${editingQuestion._id}`, formData);
        setEditingQuestion(null);
      } else {
        await axios.post("/admin/questions", formData);
      }
      fetchQuestions();
    } catch {
      alert("Failed to save question.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`/admin/questions/${id}`);
      fetchQuestions();
    } catch {
      alert("Delete failed.");
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Admin dashboard"
        title="Professional control panel for interviews and reports"
        description="Manage users, live interviews, question bank content, reports, and readiness analytics."
        actions={
          <SecondaryButton onClick={fetchLiveInterviews} disabled={interviewsLoading}>
            <RefreshCw className={`h-4 w-4 ${interviewsLoading ? "animate-spin" : ""}`} /> Refresh
          </SecondaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile title="Total Users" value="1,284" subtitle="Registered students" icon={Users} tone="indigo" trend="+12%" />
        <StatTile title="Active Users" value="428" subtitle="This week" icon={ShieldCheck} tone="green" />
        <StatTile title="Interviews" value={pendingInterviews.length + approvedInterviews.length} subtitle="Live queue" icon={Video} tone="purple" />
        <StatTile title="Avg ATS" value="76%" subtitle="Across reports" icon={Gauge} tone="orange" />
        <StatTile title="Popular Role" value="AI Analyst" subtitle="Most recommended" icon={FileText} tone="indigo" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Readiness distribution</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Student readiness score buckets.</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessDistribution}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {readinessDistribution.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">User management heatmap</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Engagement intensity by weekday and cohort.</p>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const intensity = index % 5;
              const colors = ["bg-slate-100 dark:bg-white/5", "bg-indigo-100 dark:bg-indigo-500/15", "bg-indigo-200 dark:bg-indigo-500/25", "bg-indigo-400", "bg-indigo-600"];
              return <div key={index} className={`aspect-square rounded-lg ${colors[intensity]}`} />;
            })}
          </div>
        </Card>
      </div>

      <Card hover={false} className="dark:bg-slate-800/90">
        <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Question bank management</h2>
        <QuestionForm onSave={handleSaveQuestion} editingQuestion={editingQuestion} onCancelEdit={() => setEditingQuestion(null)} />
      </Card>

      <Card hover={false}>
        <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Question table ({questions.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Domain</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Difficulty</th>
                <th className="px-3 py-3">Question</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {questions.map((q) => (
                <tr key={q._id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">{q._id}</td>
                  <td className="px-3 py-3 font-semibold">{q.domain}</td>
                  <td className="px-3 py-3">{q.type}</td>
                  <td className="px-3 py-3">{q.difficulty}</td>
                  <td className="max-w-md px-3 py-3">{q.question}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingQuestion(q)} className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200" aria-label="Edit question">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(q._id)} className="rounded-lg bg-red-50 p-2 text-red-700 dark:bg-red-500/10 dark:text-red-200" aria-label="Delete question">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {questions.length === 0 && <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No questions found.</p>}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Interview management</h2>
          {interviewsError && <p className="mt-3 text-sm font-semibold text-red-600">{interviewsError}</p>}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pending requests</h3>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                {pendingInterviews.length}
              </span>
            </div>
            {pendingInterviews.map((interview) => (
              <div key={interview._id} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-950 dark:text-white">{interview.userId?.name || "Student"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{interview.userId?.email || "-"}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{interview.domain || "-"} - {interview.experienceLevel || "-"}</p>
                    {interview.skills?.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400">Skills: {interview.skills.join(", ")}</p>
                    )}
                    {interview.meetingId && (
                      <a
                        href={`/interview-room/${interview.meetingId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <ExternalLink className="h-3 w-3" /> Join Room
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveInterview(interview._id)}
                      disabled={approvingId === interview._id || interview.status !== 'pending'}
                      title="Approve"
                      className="rounded-xl bg-emerald-600 p-2 text-white disabled:opacity-40 hover:bg-emerald-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRejectInterview(interview._id)}
                      disabled={rejectingId === interview._id || interview.status !== 'pending'}
                      title="Reject"
                      className="rounded-xl bg-red-500 p-2 text-white disabled:opacity-40 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingInterviews.length === 0 && <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No pending interview requests.</p>}
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Approved interviews</h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                {approvedInterviews.length}
              </span>
            </div>

            {approvedInterviews.map((interview) => (
              <div key={interview._id} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950 dark:text-white">{interview.userId?.name || "Student"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{interview.userId?.email || "-"}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{interview.domain || "-"} - {interview.experienceLevel || "-"}</p>
                    {interview.scheduledAt && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Scheduled: {new Date(interview.scheduledAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {interview.meetingId ? (
                    <a
                      href={`/interview-room/${interview.meetingId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Join Room
                    </a>
                  ) : (
                    <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      No room yet
                    </span>
                  )}
                </div>
              </div>
            ))}

            {approvedInterviews.length === 0 && <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No approved interviews yet.</p>}
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Reports</h2>
          <div className="mt-4 space-y-3">
            {["ATS report exports", "Interview feedback summaries", "Role recommendation audit"].map((report) => (
              <div key={report} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{report}</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">Ready</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default AdminPanel;
