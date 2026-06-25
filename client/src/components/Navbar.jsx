import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";

const logoSrc = "/careertwin-logo3.png";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const Navbar = ({ isLoggedIn, setIsLoggedIn, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsLoggedIn?.(false);
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 rounded-xl">
            <img
              src={logoSrc}
              alt="CareerTwin"
              className="h-12 w-12 rounded-[24px] border border-white/20 bg-slate-950/95 object-cover p-1 shadow-2xl shadow-slate-950/30"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-slate-950 dark:text-white">CareerTwin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Placement readiness suite</p>
            </div>
          </Link>
        </div>

        {isLoggedIn && (
          <div className="hidden min-w-0 max-w-md flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 lg:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            <Search className="h-4 w-4 shrink-0" />
            <input
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search courses, roles, interviews..."
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isLoggedIn ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  aria-label="Open notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-950" />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900">
                    {["ATS report improved by 8%", "Live interview request is pending", "New role path: AI Product Analyst"].map((item) => (
                      <div key={item} className="rounded-xl p-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="hidden md:inline">{user.name || "Student"}</span>
                  <ChevronDown className="hidden h-4 w-4 md:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900">
                    <Link to="/digital-twin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                      <User className="h-4 w-4" /> Digital twin
                    </Link>
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                      <Settings className="h-4 w-4" /> Preferences
                    </button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                Login
              </Link>
              <Link to="/register" className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20">
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-200 dark:hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-white/10">
          <Link to="/" className="block rounded-xl px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="block rounded-xl px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="w-full rounded-xl px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block rounded-xl px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block rounded-xl px-4 py-2 font-semibold text-indigo-600" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
