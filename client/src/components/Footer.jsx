import React from "react";
import { Link } from "react-router-dom";


const Footer = () => (
  <footer className="mt-16 border-t border-slate-200 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 py-10 text-slate-300 shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.12)]">
    <div className="mx-auto max-w-7xl px-6 py-14">

      {/* Top Section */}
      <div className="grid gap-10 md:grid-cols-3">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Career Portal
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Empowering candidates with AI-powered interview practice,
            digital twin analysis, and live mock interviews to accelerate
            career growth.
          </p>
        </div>

        {/* Platform Links */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Platform
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white transition">AI Interview</li>
            <li className="hover:text-white transition">Digital Twin</li>
            <li className="hover:text-white transition">ATS Score</li>
            <li className="hover:text-white transition">Live Interview</li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Connect
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white transition">Support</li>
            <li className="hover:text-white transition">Privacy Policy</li>
            <li className="hover:text-white transition">Terms of Service</li>
          </ul>
        </div>

      </div>

      {/* Divider */}
      <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} AI Career Portal. All rights reserved.
        </p>

        <p className="text-xs text-slate-500">
          Built By Ready4Hire❤️💕❤️
        </p>

      </div>
    </div>
  </footer>
);


export default Footer;
