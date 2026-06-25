import React from "react";

export default function StatCard({ title, value, change }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm shadow-slate-200/40 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 hover:border-indigo-200/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-slate-600">{title}</h5>
        {change !== 0 && (
          <div className={`text-xs font-semibold px-2 py-1 rounded ${
            change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {change >= 0 ? `+${change}%` : `${change}%`}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
