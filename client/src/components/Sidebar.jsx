import { Link, useLocation } from "react-router-dom";
import {
  Bot,
  BriefcaseBusiness,
  Gauge,
  LayoutDashboard,
  Radio,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

const features = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Role Recommender", path: "/role-recommender", icon: BriefcaseBusiness },
  { name: "ATS Score", path: "/ats-score", icon: ShieldCheck },
  { name: "AI Interview", path: "/ai-interview", icon: Bot },
  { name: "Live Interview", path: "/live-interview", icon: Radio },
  { name: "Digital Twin", path: "/digital-twin", icon: UserRoundCog },
  { name: "Admin", path: "/admin", icon: Gauge },
];

export default function Sidebar({ collapsed = false }) {
  const location = useLocation();
  const role = localStorage.getItem("role") || "user";
  const visibleFeatures = role === "admin" ? features : features.filter((feature) => feature.path !== "/admin");

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-64px)] shrink-0 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/72 lg:flex ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <nav className="flex w-full flex-col gap-2 p-3">
        <div className="mb-2 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-4 dark:from-indigo-500/10 dark:to-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            {collapsed ? "AI" : "Career OS"}
          </p>
          {!collapsed && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Build, measure, improve.</p>}
        </div>

        {visibleFeatures.map((feature) => {
          const Icon = feature.icon;
          const isActive = location.pathname === feature.path;
          return (
            <Link
              key={feature.path}
              to={feature.path}
              title={feature.name}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{feature.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
