import React from "react";

export default function ActivityCard({ title, subtitle, time }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
      </div>
      <div className="text-xs text-slate-400 shrink-0">{time}</div>
    </div>
  );
}
