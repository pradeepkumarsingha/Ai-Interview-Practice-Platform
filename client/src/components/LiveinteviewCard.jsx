import React, { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, Radio, RefreshCw, UserRoundCheck } from "lucide-react";
import axios from "../api/axiosInstance";
import { Card, PrimaryButton, SecondaryButton } from "./ui";

const steps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "approved", label: "Accepted", icon: CheckCircle2 },
  { key: "scheduled", label: "Scheduled", icon: CalendarCheck },
  { key: "completed", label: "Completed", icon: UserRoundCheck },
];

const statusIndex = (status) => {
  if (status === "approved" || status === "live") return 1;
  if (status === "scheduled") return 2;
  if (status === "completed") return 3;
  return 0;
};

const LiveInterviewCard = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLatestRequest = async () => {
    try {
      setStatusLoading(true);
      setError("");
      const res = await axios.get("/ai/request-live-interview");
      setInterview(res.data?.request || null);
    } catch (err) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      if (status === 401) setError("Session expired or invalid token. Please login again.");
      else if (status === 404) setError("Interview status API not found. Restart backend server.");
      else setError(serverMessage || "Failed to load interview status.");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestRequest();
    const intervalId = setInterval(fetchLatestRequest, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const requestInterview = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post("/ai/request-live-interview", {
        domain: "Frontend",
        experienceLevel: "Beginner",
      });
      setInterview(res.data.request);
    } catch (err) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      setError(status === 401 ? "Session expired or invalid token. Please login again." : serverMessage || "Failed to schedule interview.");
    } finally {
      setLoading(false);
    }
  };

  const activeStep = statusIndex(interview?.status);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card hover={false}>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Request interview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get matched with an assigned interviewer.</p>
          </div>
        </div>

        {!interview ? (
          <PrimaryButton onClick={requestInterview} disabled={loading} className="w-full">
            {loading ? "Scheduling..." : "Request live interview"}
          </PrimaryButton>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current status</p>
              <p className="mt-1 text-2xl font-bold capitalize text-slate-950 dark:text-white">{interview.status}</p>
            </div>
            {interview.meetingLink ? (
              <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">
                Join interview
              </a>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Waiting for admin approval. Status refreshes automatically.</p>
            )}
            <SecondaryButton onClick={fetchLatestRequest} disabled={statusLoading} className="w-full">
              <RefreshCw className={`h-4 w-4 ${statusLoading ? "animate-spin" : ""}`} />
              Refresh status
            </SecondaryButton>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
      </Card>

      <Card hover={false}>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Status timeline</h2>
        <div className="mt-6 space-y-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = index <= activeStep;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-white/10"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && <div className={`mt-2 h-8 w-px ${index < activeStep ? "bg-indigo-500" : "bg-slate-200 dark:bg-white/10"}`} />}
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{step.label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {index === 0 && "Request submitted for admin review."}
                    {index === 1 && "Interviewer accepts the session."}
                    {index === 2 && "Meeting link and schedule become available."}
                    {index === 3 && "Feedback and completion status are saved."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default LiveInterviewCard;
