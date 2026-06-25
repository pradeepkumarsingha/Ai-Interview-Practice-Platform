import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, TrendingUp } from "lucide-react";

/* eslint-disable react-refresh/only-export-components */
const MotionDiv = motion.div;
const MotionSection = motion.section;
const MotionCircle = motion.circle;

export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <MotionDiv {...pageMotion} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300 lg:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </MotionDiv>
  );
}

export function Card({ children, className = "", hover = true }) {
  return (
    <MotionSection
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72 dark:shadow-black/20",
        className
      )}
    >
      {children}
    </MotionSection>
  );
}

export function StatTile({ title, value, subtitle, icon: Icon = TrendingUp, tone = "indigo", trend }) {
  const TileIcon = Icon;
  const tones = {
    indigo: { line: "from-indigo-500 to-blue-500", icon: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200" },
    purple: { line: "from-purple-500 to-fuchsia-500", icon: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200" },
    green: { line: "from-emerald-500 to-green-500", icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" },
    orange: { line: "from-orange-500 to-amber-500", icon: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200" },
    red: { line: "from-red-500 to-rose-500", icon: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200" },
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone]?.line}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className={cn("rounded-2xl p-3", tones[tone]?.icon)}>
          <TileIcon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
          {trend}
        </div>
      )}
    </Card>
  );
}

export function ProgressBar({ value, tone = "indigo" }) {
  const color = {
    indigo: "from-indigo-500 to-blue-500",
    purple: "from-purple-500 to-fuchsia-500",
    green: "from-emerald-500 to-green-500",
    orange: "from-orange-500 to-amber-500",
    red: "from-red-500 to-rose-500",
  }[tone];

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <MotionDiv
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(Number(value) || 0, 0), 100)}%` }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className={cn("h-full rounded-full bg-gradient-to-r", color)}
      />
    </div>
  );
}

export function Gauge({ value, label, tone = "indigo", size = 180 }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const color = {
    indigo: "stroke-indigo-500",
    purple: "stroke-purple-500",
    green: "stroke-emerald-500",
    orange: "stroke-orange-500",
    red: "stroke-red-500",
  }[tone];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" className="stroke-slate-100 dark:stroke-white/10" strokeWidth="10" />
          <MotionCircle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-950 dark:text-white">{pct}%</span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-200/80 dark:bg-white/10", className)} />;
}

export function Chip({ children, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/20",
    purple: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:ring-purple-400/20",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/20",
    orange: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-400/20",
    red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/20",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1", tones[tone])}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}
