import React, { useState } from 'react';

const NotesPanel = ({ onSaveFeedback }) => {
  const [notes, setNotes] = useState('');
  const [communicationScore, setCommunicationScore] = useState(0);
  const [technicalScore, setTechnicalScore] = useState(0);

  const handleSubmit = () => {
    onSaveFeedback({ notes, communicationScore, technicalScore });
  };

  return (
    <div className="flex flex-col h-full border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Interviewer Notes & Evaluation</h3>
      </div>
      
      <div className="p-4 flex-grow flex flex-col space-y-4 overflow-y-auto">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Live Notes</label>
          <textarea
            className="w-full h-32 p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 dark:text-slate-200"
            placeholder="Jot down observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Communication Score (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-200"
            value={communicationScore}
            onChange={(e) => setCommunicationScore(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Technical Score (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-200"
            value={technicalScore}
            onChange={(e) => setTechnicalScore(Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
        >
          Save Feedback
        </button>
      </div>
    </div>
  );
};

export default NotesPanel;
