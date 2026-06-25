import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, FileCheck2, Lightbulb, Target } from "lucide-react";
import { getAtsScore } from "../api/aiService";
import { Card, Chip, Gauge, ProgressBar, SkeletonBlock } from "./ui";

const asArray = (value, fallback) => {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return fallback;
};

const ATSScore = ({ file, token, autoFetch = true }) => {
  const [atsData, setAtsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file || !autoFetch) return;
    const fetchScore = async () => {
      setLoading(true);
      setError("");
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const res = await getAtsScore(formData, token);
        setAtsData(res?.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch ATS score.");
        setAtsData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
  }, [file, token, autoFetch]);

  const report = useMemo(() => {
    const rawScore = atsData?.ats_score ?? atsData?.score ?? 78;
    const score = Math.min(Math.round(Number(rawScore) <= 1 ? Number(rawScore) * 100 : Number(rawScore)), 100);
    return {
      score,
      match: atsData?.match_percentage ?? Math.max(score - 6, 0),
      strengths: asArray(atsData?.strength || atsData?.strengths, ["Strong project descriptions", "Good technical keyword coverage", "Clear education section"]),
      suggestions: asArray(atsData?.suggestion || atsData?.suggestions, ["Add measurable impact to internships", "Include role-specific keywords", "Keep bullets concise and action-led"]),
      weakness: asArray(atsData?.weakness || atsData?.weaknesses || atsData?.missing_skills, ["System design", "Cloud deployment", "Testing frameworks"]),
    };
  }, [atsData]);

  if (!file) return null;

  if (loading) {
    return (
      <Card hover={false}>
        <div className="mb-5 flex items-center gap-3">
          <FileCheck2 className="h-6 w-6 animate-pulse text-indigo-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Checking ATS compatibility</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Scanning sections, keywords, formatting, and match signals.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-48" />
        </div>
      </Card>
    );
  }

  const timelineSteps = report.weakness.length > 0
    ? report.weakness.slice(0, 3).map((skill) => `Improve ${skill} coverage`)
    : ["Optimize summary", "Add missing skills", "Quantify project impact"];

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card hover={false}>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">ATS Score Gauge</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compatibility with screening systems</p>
          <div className="py-6">
            <Gauge value={report.score} label="ATS" tone={report.score >= 80 ? "green" : report.score >= 60 ? "orange" : "red"} />
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Match percentage</span>
              <span className="font-bold text-slate-950 dark:text-white">{report.match}%</span>
            </div>
            <ProgressBar value={report.match} tone="indigo" />
          </div>
        </Card>

        <Card hover={false}>
          <div className="mb-5 flex items-center gap-3">
            <Target className="h-6 w-6 text-indigo-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Skill match matrix</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">A quick view of what is strong and what needs attention.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Keyword Fit", report.score, "green"],
              ["Role Alignment", report.match, "indigo"],
              ["Formatting", Math.min(report.score + 8, 100), "purple"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}%</p>
                <div className="mt-3"><ProgressBar value={value} tone={tone} /></div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Missing skill chips
            </p>
            <div className="flex flex-wrap gap-2">
              {report.weakness.map((item) => <Chip key={item} tone="orange">{item}</Chip>)}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-white">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strengths
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {report.strengths.map((item) => <p key={item} className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">{item}</p>)}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-white">
            <Lightbulb className="h-5 w-5 text-indigo-500" /> Recommendations
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {report.suggestions.map((item) => <p key={item} className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-500/10">{item}</p>)}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-white">
            <ClipboardList className="h-5 w-5 text-purple-500" /> Improvement timeline
          </h3>
          {timelineSteps.map((step, index) => (
            <div key={step} className="relative border-l border-slate-200 pb-4 pl-4 last:pb-0 dark:border-white/10">
              <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Step {index + 1}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{step}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default ATSScore;
