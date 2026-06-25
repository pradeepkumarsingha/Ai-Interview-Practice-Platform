import React, { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Brain, FileUp, Route, Sparkles, UserRoundCog } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { Card, Chip, Gauge, PageHeader, PrimaryButton, ProgressBar, SkeletonBlock } from "../components/ui";
import { getDigitalTwin } from "../api/aiService";

const DigitalTwin = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await getDigitalTwin(formData, token);
      setResult(res.data);
    }
    catch (err) {
  console.error("Digital Twin Error:", err);

  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;

    switch (status) {
      case 400:
        setError(
          data.detail ||
          data.error ||
          data.message ||
          "The uploaded resume is invalid or could not be processed."
        );
        break;

      case 401:
        setError("Your session has expired. Please login again.");
        break;

      case 413:
        setError("The uploaded file is too large.");
        break;

      case 415:
        setError("Only PDF, DOC, DOCX and TXT files are supported.");
        break;

      case 500:
        setError("Internal server error. Please try again later.");
        break;

      default:
        setError(
          data.detail ||
          data.error ||
          "Something went wrong."
        );
    }
  } else if (err.request) {
    setError("Unable to connect to the server.");
  } else {
    setError(err.message || "Unexpected error occurred.");
  }
}
    finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Digital twin"
        title="A futuristic AI profile for your placement readiness"
        description="Visualize recommended role, ATS score, interview signals, strengths, weaknesses, readiness, radar, heatmap, and progress timeline."
      />

      <Card hover={false} className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-purple-50 p-3 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200">
              <UserRoundCog className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Generate your AI career profile</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Upload a resume and let the platform build your career twin.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:file:bg-purple-500/10 dark:file:text-purple-200"
            />
            {file && <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><FileUp className="h-4 w-4 text-purple-500" /> {file.name}</p>}
            <PrimaryButton onClick={uploadResume} disabled={loading || !file} className="w-full">
              <Sparkles className="h-4 w-4" /> {loading ? "Building twin..." : "Analyze resume"}
            </PrimaryButton>
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
      </Card>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      )}

      {result && <ResumeAnalysisDisplay result={result} />}
    </DashboardShell>
  );
};

const ResumeAnalysisDisplay = ({ result }) => {
  const score = Math.round(result.career_readiness_score || result.readiness_score || 78);
  const atsScore = Math.round(result.ats_score || result.score || Math.max(score - 6, 0));
  const recommendedRole = result.recommended_role || result.predicted_role || result.recommended_roles?.[0] || "AI Product Analyst";
  const summary = result.summary || "Your profile shows strong applied learning signals with room to sharpen role-specific keywords and interview storytelling.";
  const skillGaps = result.skill_gaps || result.weaknesses || ["System design", "Cloud deployment", "Quantified project impact"];
  const learningPath = result.recommended_learning_path || ["Strengthen resume keywords", "Build one portfolio case study", "Practice behavioral interview stories"];
  const strengths = result.strengths || ["Project-based learning", "Modern web stack", "Problem solving"];
  const radarData = [
    { skill: "ATS", value: atsScore },
    { skill: "Interview", value: result.interview_score || 74 },
    { skill: "Projects", value: 84 },
    { skill: "Role Fit", value: score },
    { skill: "Learning", value: 80 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card hover={false} className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
          <div className="mb-4 flex items-center gap-3">
            <Brain className="h-7 w-7 text-indigo-200" />
            <div>
              <p className="text-sm text-indigo-200">Recommended role</p>
              <h2 className="text-2xl font-bold">{recommendedRole}</h2>
            </div>
          </div>
          <Gauge value={score} label="Ready" tone="green" />
          <p className="mt-5 text-sm leading-relaxed text-indigo-100">{summary}</p>
        </Card>

        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">AI profile radar</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Radar dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Strengths</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {strengths.map((item) => <Chip key={item} tone="green">{item}</Chip>)}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Weaknesses</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {skillGaps.map((item) => <Chip key={item} tone="orange">{item}</Chip>)}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Score stack</h3>
          <div className="mt-4 space-y-4">
            {[["ATS Score", atsScore, "indigo"], ["Interview Score", result.interview_score || 74, "purple"], ["Readiness", score, "green"]].map(([label, value, tone]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="font-bold text-slate-950 dark:text-white">{value}%</span>
                </div>
                <ProgressBar value={value} tone={tone} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Skill heatmap</h2>
          <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {["React", "Node", "SQL", "Python", "DSA", "APIs", "Cloud", "Testing", "AI", "Metrics", "UX", "Git"].map((skill, index) => (
              <div key={skill} className={`rounded-2xl p-3 text-center text-xs font-bold ${index % 4 === 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : index % 3 === 0 ? "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200"}`}>
                {skill}
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
            <Route className="h-5 w-5 text-indigo-500" /> Career progress timeline
          </h2>
          <div className="mt-5">
            {learningPath.map((step, index) => (
              <div key={step} className="relative border-l border-slate-200 pb-5 pl-5 last:pb-0 dark:border-white/10">
                <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                <p className="text-sm font-bold text-slate-950 dark:text-white">Phase {index + 1}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(step).replace(/\*\*/g, "")}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DigitalTwin;
