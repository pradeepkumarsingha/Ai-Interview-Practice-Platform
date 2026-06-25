import React, { useState } from "react";
import { Download, FileText, UploadCloud } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import ATSScore from "../components/ATSScore";
import { Card, PageHeader, PrimaryButton } from "../components/ui";

const ATSScorePage = () => {
  const [file, setFile] = useState(null);
  const [startCheck, setStartCheck] = useState(false);
  const token = localStorage.getItem("token");

  const handleCheckScore = () => {
    if (!file) return;
    setStartCheck(true);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="ATS resume checker"
        title="Resume scoring built for applicant tracking systems"
        description="Upload your resume to view an ATS gauge, match percentage, missing skills, recommendations, and an improvement timeline."
        actions={
          <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        }
      />

      <Card hover={false}>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-2xl bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Upload resume</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Supports PDF, DOC, DOCX, and TXT. The report area never goes blank while processing.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-white/15 dark:bg-white/5">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setStartCheck(false);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:file:bg-indigo-500/10 dark:file:text-indigo-200"
            />
            {file && (
              <p className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <FileText className="h-4 w-4 text-indigo-500" /> {file.name}
              </p>
            )}
            <PrimaryButton onClick={handleCheckScore} disabled={!file} className="w-full">
              Analyze ATS score
            </PrimaryButton>
          </div>
        </div>
      </Card>

      {startCheck && <ATSScore file={file} token={token} autoFetch />}
    </DashboardShell>
  );
};

export default ATSScorePage;
