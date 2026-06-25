import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children, isLoggedIn = true, setIsLoggedIn = () => {} }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gradient-to-br dark:from-slate-900 dark:to-indigo-900 dark:text-white">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onToggleSidebar={() => setCollapsed((value) => !value)} />
      <div className="flex">
        <Sidebar collapsed={collapsed} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
