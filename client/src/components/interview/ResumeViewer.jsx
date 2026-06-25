import React from 'react';

const ResumeViewer = ({ resumeUrl, loading = false }) => {
  return (
    <div className="flex flex-col h-full border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Candidate Resume</h3>
      </div>
      <div className="flex-grow p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Loading resume...</p>
          </div>
        ) : resumeUrl ? (
          <iframe
            src={resumeUrl}
            className="w-full h-full border-none"
            title="Resume Viewer"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>No resume provided for this interview.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeViewer;
