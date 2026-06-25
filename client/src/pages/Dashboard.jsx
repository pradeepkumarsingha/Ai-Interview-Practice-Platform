import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  Gauge,
  Radio,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardShell from "../components/DashboardShell";
import { Card, Gauge as ScoreGauge, PageHeader, ProgressBar, SkeletonBlock, StatTile } from "../components/ui";
import axios from "../api/axiosInstance";

const fallbackProgress = [
  { week: "W1", score: 58 },
  { week: "W2", score: 64 },
  { week: "W3", score: 71 },
  { week: "W4", score: 78 },
  { week: "W5", score: 84 },
];

const skillRadar = [
  { skill: "DSA", value: 72 },
  { skill: "Projects", value: 84 },
  { skill: "Communication", value: 76 },
  { skill: "Resume", value: 81 },
  { skill: "System Design", value: 64 },
];

const interviewBars = [
  { area: "Clarity", score: 78 },
  { area: "Depth", score: 72 },
  { area: "Examples", score: 68 },
  { area: "Confidence", score: 82 },
];

const Dashboard = ({ isLoggedIn, setIsLoggedIn }) => {
  const [statsData, setStatsData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchStats = async () => {
      try {
        const res = await axios.get("/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatsData(res.data);
        setActivities(
          (res.data.recentActivity || []).map((item) => ({
            title: "Mock interview completed",
            subtitle: `Average score: ${item.averageScore ?? "N/A"}`,
            time: new Date(item.createdAt).toLocaleDateString(),
          }))
        );
      } catch {
        setStatsData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const average = Math.round(statsData?.averageScore || 76);
  const atsScore = Math.max(average + 6, 0);
  const readiness = Math.min(Math.round(average * 1.08), 96);
  const scoreHistory = statsData?.scoreHistory?.length
    ? statsData.scoreHistory.map((score, index) => ({ week: `S${index + 1}`, score: Math.round(score) }))
    : fallbackProgress;

  return (
    <DashboardShell isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
      <PageHeader
        eyebrow="Student dashboard"
        title="Your career readiness command center"
        description="Track ATS performance, role fit, interview strength, and weekly momentum from one responsive workspace."
        actions={
          <Link to="/role-recommender" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 hover:from-violet-500 hover:via-indigo-500 hover:to-sky-400">
            <Sparkles className="h-4 w-4" /> Analyze profile
          </Link>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatTile title="ATS Score" value={`${atsScore}%`} subtitle="Resume compatibility" icon={FileCheck2} tone="indigo" trend="+8% this week" />
          <StatTile title="Recommended Role" value="AI Analyst" subtitle="Top profile match" icon={BriefcaseBusiness} tone="purple" />
          <StatTile title="AI Interview" value={`${average}/100`} subtitle="Latest practice score" icon={Bot} tone="green" trend="+4 points" />
          <StatTile title="Live Interview" value="Pending" subtitle="Admin review" icon={Radio} tone="orange" />
          <StatTile title="Readiness" value={`${readiness}%`} subtitle="Placement confidence" icon={Gauge} tone="green" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="min-h-[360px]" hover={false}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Weekly Progress</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Learning and interview score trend</p>
            </div>
            <CalendarClock className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fill="url(#progressGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Career Readiness Gauge</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Composite readiness score</p>
          <div className="py-6">
            <ScoreGauge value={readiness} label="Ready" tone="green" />
          </div>
          <div className="space-y-4">
            {[
              ["Technical skill", 82, "indigo"],
              ["Interview clarity", average, "purple"],
              ["Resume strength", atsScore, "green"],
            ].map(([label, value, tone]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="font-semibold text-slate-950 dark:text-white">{value}%</span>
                </div>
                <ProgressBar value={value} tone={tone} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card hover={false}>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Skill Radar</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <Radar dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.22} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Interview Performance</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interviewBars}>
                <XAxis dataKey="area" axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {(activities.length ? activities : [
              { title: "Resume scan completed", subtitle: "ATS score increased", time: "Today" },
              { title: "Role path updated", subtitle: "AI Analyst recommended", time: "Yesterday" },
              { title: "Interview practice", subtitle: "Confidence improved", time: "2 days ago" },
            ]).map((activity) => (
              <div key={`${activity.title}-${activity.time}`} className="rounded-2xl border border-slate-100 p-3 dark:border-white/10">
                <p className="font-semibold text-slate-900 dark:text-white">{activity.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{activity.subtitle}</p>
                <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
