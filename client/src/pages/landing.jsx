import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  FileCheck2,
  Gauge,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MotionDiv = motion.div;
const logoSrc = "/careertwin-logo.png";

const roles = ["AI Analyst", "Full Stack Developer", "Data Engineer", "Product Analyst"];

const productStats = [
  { value: "ATS", label: "Resume scoring", icon: FileCheck2 },
  { value: "AI", label: "Interview feedback", icon: Mic },
  { value: "Twin", label: "Career profile", icon: BrainCircuit },
];

const modules = [
  {
    title: "Role Recommender",
    description: "Profile-to-role matching powered by the AI service.",
    icon: Sparkles,
    href: "/role-recommender",
  },
  {
    title: "ATS Analyzer",
    description: "Resume score, skill gaps, keyword matrix, and report export.",
    icon: ShieldCheck,
    href: "/ats-score",
  },
  {
    title: "AI Interview",
    description: "Timed questions, voice input, and final evaluation cards.",
    icon: Bot,
    href: "/ai-interview",
  },
  {
    title: "Digital Twin",
    description: "A futuristic readiness profile with radar and heatmap views.",
    icon: Gauge,
    href: "/digital-twin",
  },
];

const LandingPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const [text, setText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    const current = roles[roleIndex];
    const interval = setInterval(() => {
      setText(current.slice(0, i + 1));
      i += 1;
      if (i === current.length) {
        clearInterval(interval);
        setTimeout(() => {
          setText("");
          setRoleIndex((prev) => (prev + 1) % roles.length);
        }, 1200);
      }
    }, 85);
    return () => clearInterval(interval);
  }, [roleIndex]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <main>
        <section className="relative min-h-[88vh] overflow-hidden">
          <img
            src={logoSrc}
            alt="CareerTwin"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/35" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

          <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-16 sm:px-6 lg:px-8">
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100 backdrop-blur">
                <Sparkles className="h-4 w-4" /> CareerTwin
              </div>
              <h1 className="mt-5 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Navigate your future with an AI career twin
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                Resume intelligence, role recommendations, AI interview practice, live interviews, and digital twin readiness in one student-friendly platform.
              </p>
              <p className="mt-5 text-base font-semibold text-blue-100">
                Optimizing for: <span className="text-cyan-300">{text}</span>
                <span className="ml-1 animate-pulse text-cyan-300">|</span>
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={isLoggedIn ? "/dashboard" : "/register"}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:from-indigo-400 hover:via-sky-400 hover:to-cyan-300"
                >
                  {isLoggedIn ? "Open dashboard" : "Start CareerTwin"} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={isLoggedIn ? "/ai-interview" : "/login"}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <Radio className="h-4 w-4" /> {isLoggedIn ? "Practice interview" : "Login"}
                </Link>
              </div>
            </MotionDiv>
          </div>

          <div className="mx-auto mt-10 grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {productStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <div>
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-xs text-slate-300">{item.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Connected platform</p>
                <h2 className="mt-2 text-3xl font-bold text-white">AI service powered modules</h2>
              </div>
              <p className="max-w-2xl text-sm text-slate-300">
                Role prediction, ATS scoring, digital twin analysis, and interview evaluation are routed through the shared AI service layer.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.title}
                    to={isLoggedIn ? module.href : "/login"}
                    className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.09]"
                  >
                    <div className="mb-5 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{module.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{module.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
                      Open module <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
