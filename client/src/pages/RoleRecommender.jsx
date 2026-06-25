import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileUp, GraduationCap, Layers3, Loader2, Sparkles } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { Card, Chip, PageHeader, PrimaryButton, ProgressBar, SkeletonBlock } from "../components/ui";
import { predictRole, uploadResume } from "../api/aiService";

const MotionDiv = motion.div;

const fallbackRoles = [
  {
    title: "AI Product Analyst",
    score: 92,
    path: "Data Analyst -> AI Analyst -> AI Product Manager",
    skills: ["SQL", "Python", "Prompting", "Product Metrics"],
    learning: ["Model evaluation basics", "A/B testing", "Dashboard storytelling"],
  },
  {
    title: "Full Stack Developer",
    score: 86,
    path: "Frontend Intern -> MERN Developer -> Platform Engineer",
    skills: ["React", "Node.js", "MongoDB", "APIs"],
    learning: ["System design", "Testing", "Cloud deployment"],
  },
  {
    title: "Data Engineer",
    score: 79,
    path: "SQL Developer -> Data Engineer -> Analytics Engineer",
    skills: ["ETL", "Python", "Warehousing", "Pipelines"],
    learning: ["Airflow", "dbt", "Data modeling"],
  },
];

const normalizeRoles = (recommendations) => {
  if (!recommendations) return fallbackRoles;

  const rolesArray = recommendations.recommended_roles || recommendations.roles;
  const predictedRole = recommendations.predicted_role;
  const confidence = recommendations.confidence;

  if (predictedRole) {
    return [
      {
        ...fallbackRoles[0],
        title: predictedRole,
        score: Math.round((confidence || 0.9) * 100),
      },
      ...fallbackRoles.slice(1),
    ];
  }

  if (Array.isArray(rolesArray) && rolesArray.length) {
    return rolesArray.slice(0, 3).map((role, index) => ({
      ...fallbackRoles[index],
      title: role.title || role.name || role.role || role,
      score: Math.round((role.score || role.confidence || role.confidence_score || fallbackRoles[index].score / 100) * 100),
      skills: role.skills || role.required_skills || fallbackRoles[index].skills,
      learning: role.learning || role.recommended_learning || fallbackRoles[index].learning,
    }));
  }

  return fallbackRoles;
};

const RoleRecommender = () => {
  const [inputMode, setInputMode] = useState("paste");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState(0);
  const [internships, setInternships] = useState(0);
  const [certifications, setCertifications] = useState(0);
  const [cgpa, setCgpa] = useState(0.0);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0] || null);
  };
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = useMemo(() => normalizeRoles(recommendations), [recommendations]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations(null);

    if (resumeFile) {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      try {
        const res = await uploadResume(formData);
        setRecommendations(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to get recommendations.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (inputMode === "paste") {
      if (!resumeText || resumeText.trim().length < 10) {
        setError("Please paste at least 10 characters from your resume or upload a file.");
        setLoading(false);
        return;
      }
      try {
        const res = await predictRole(resumeText.trim());
        setRecommendations(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to get recommendations.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Form input mode
    if (!skills.trim()) {
      setError("Please provide a skills summary for the profile form.");
      setLoading(false);
      return;
    }

    try {
      const res = await predictRole({
        skills: skills.trim(),
        projects,
        internships,
        certifications,
        cgpa,
      });
      setRecommendations(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="AI role recommender"
        title="Upload your resume, discover your strongest role path"
        description="A premium recommendation flow with animated processing, confidence scoring, skill gaps, and learning areas."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden" hover={false}>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
              <FileUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Resume intake</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Paste your resume text or profile summary.</p>
            </div>
          </div>

          <form onSubmit={handleRecommend} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("paste");
                    setResumeFile(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${inputMode === "paste" ? "bg-indigo-600 text-white" : "bg-slate-900/70 text-slate-200"}`}
                >
                  Paste resume
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("form");
                    setResumeFile(null);
                    setResumeText("");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${inputMode === "form" ? "bg-indigo-600 text-white" : "bg-slate-900/70 text-slate-200"}`}
                >
                  Fill profile form
                </button>
              </div>

              {inputMode === "paste" ? (
                <textarea
                  name="resume"
                  placeholder="Example: Computer science student skilled in React, Python, SQL, dashboards, and API development..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  disabled={resumeFile !== null}
                  required={!resumeFile}
                  autoComplete="off"
                  className="h-64 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/10"
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Skills summary</label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Python, SQL, React, machine learning, data analysis"
                      className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Projects</label>
                    <input
                      type="number"
                      min="0"
                      value={projects}
                      onChange={(e) => setProjects(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Internships</label>
                    <input
                      type="number"
                      min="0"
                      value={internships}
                      onChange={(e) => setInternships(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Certifications</label>
                    <input
                      type="number"
                      min="0"
                      value={certifications}
                      onChange={(e) => setCertifications(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">CGPA</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/10"
                    />
                  </div>
                </div>
              )}

              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
              />

              <PrimaryButton type="submit" disabled={loading || (!resumeText && !resumeFile && (inputMode === "paste" ? true : !skills.trim()))} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing input" : "Get role recommendations"}
              </PrimaryButton>
            </form>

          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        </Card>

        <div className="space-y-6">
          {loading ? (
            <Card hover={false}>
              <div className="mb-5 flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 animate-pulse text-indigo-500" />
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">AI processing</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Parsing skills, projects, education, and role signals.</p>
                </div>
              </div>
              <div className="space-y-3">
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
              </div>
            </Card>
          ) : (
            <Card className="border-white/40 bg-white/70 shadow-xl shadow-indigo-500/5 dark:bg-white/5" hover={false}>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Top recommended roles</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Confidence scores and career growth path.</p>
                </div>
                <Layers3 className="h-5 w-5 text-purple-500" />
              </div>

              <div className="space-y-4">
                {roles.map((role, index) => (
                  <MotionDiv
                    key={role.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Rank {index + 1}</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{role.title}</h3>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <GraduationCap className="h-4 w-4" /> {role.path}
                        </p>
                      </div>
                      <div className="min-w-36">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium text-slate-600 dark:text-slate-300">Confidence</span>
                          <span className="font-bold text-slate-950 dark:text-white">{role.score}%</span>
                        </div>
                        <ProgressBar value={role.score} tone={index === 0 ? "green" : index === 1 ? "indigo" : "purple"} />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Required skills</p>
                        <div className="flex flex-wrap gap-2">
                          {role.skills.map((skill) => <Chip key={skill} tone="indigo">{skill}</Chip>)}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Recommended learning</p>
                        <div className="flex flex-wrap gap-2">
                          {role.learning.map((item) => <Chip key={item} tone="purple">{item}</Chip>)}
                        </div>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Career growth path</h2>
            <p className="mt-1 text-indigo-100">Beginner friendly roadmap from current skills to placement-ready profile.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {["Foundation", "Portfolio", "Interview", "Apply"].map((step, index) => (
              <React.Fragment key={step}>
                <span className="rounded-full bg-white/15 px-4 py-2">{step}</span>
                {index < 3 && <ArrowRight className="h-4 w-4 text-indigo-100" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
};

export default RoleRecommender;
