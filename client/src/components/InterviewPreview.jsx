import React, { useState } from "react";



const answerTraits = [
  {
    label: "role",
    keywords: ["i", "my", "me", "responsible", "led", "managed", "owned", "coordinated", "supervised"],
    prompt: "Talk about your specific role in the work."
  },
  {
    label: "problem",
    keywords: ["problem", "challenge", "issue", "need", "requirement", "roadblock", "goal", "objective"],
    prompt: "Mention the problem or challenge you were solving."
  },
  {
    label: "action",
    keywords: ["built", "developed", "designed", "implemented", "created", "launched", "optimized", "improved", "automated"],
    prompt: "Describe the actions you took to solve it."
  },
  {
    label: "result",
    keywords: ["result", "impact", "reduced", "increased", "saved", "improved", "boosted", "delivered", "achieved", "outcome"],
    prompt: "Explain the result or impact of your work."
  },
  {
    label: "tech",
    keywords: ["react", "node", "python", "api", "cloud", "backend", "frontend", "database", "sql", "javascript", "typescript", "express", "aws", "docker"],
    prompt: "Include the tools or technologies you used."
  },
];

function calculateInterviewScore(answer) {
  if (!answer || !answer.trim()) {
    return { score: 0, feedback: "Please enter an answer before evaluation." };
  }

  const text = answer.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const matchedTraits = answerTraits.map((trait) => ({
    ...trait,
    matched: trait.keywords.some((keyword) => text.includes(keyword)),
  }));

  const traitCount = matchedTraits.filter((trait) => trait.matched).length;
  let score = traitCount * 15;

  if (words.length >= 40) {
    score += 20;
  } else if (words.length >= 25) {
    score += 10;
  } else {
    score -= 10;
  }

  if (/\d+/.test(text)) {
    score += 5;
  }

  if (traitCount <= 1) {
    score -= 15;
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  const missingTraits = matchedTraits.filter((trait) => !trait.matched).map((trait) => trait.prompt);
  let feedback = "Good start. Add more structure and detail.";

  if (score >= 80) {
    feedback = "Strong answer 👍 Good structure, clear role, and impact.";
  } else if (score >= 60) {
    feedback = "Solid answer. Add more specific results and technical detail.";
  } else if (score >= 40) {
    feedback = "Fair answer. Be more explicit about the problem, your actions, and the outcome.";
  } else {
    feedback = "Weak answer. Focus on your role, the challenge, what you did, and what changed.";
  }

  if (missingTraits.length > 0 && score < 80) {
    feedback += ` Suggested focus: ${missingTraits.join(" ")}`;
  }

  return { score, feedback };
}

const InterviewPreview = () => {
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEvaluate = () => {
    setLoading(true);
    setScore(0);
    setTimeout(() => {
      const result = calculateInterviewScore(answer);
      let current = 0;
      const interval = setInterval(() => {
        current++;
        setScore(current);
        if (current >= result.score) {
          clearInterval(interval);
          setFeedback(result.feedback);
          setLoading(false);
        }
      }, 20);
    }, 1200);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 w-full max-w-md hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-200/80 transition-all duration-300">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🎤 Live AI interview preview</h3>
      <div className="bg-slate-100/80 rounded-xl px-4 py-3 text-slate-700 text-sm mb-4 border border-slate-200/60">
        Tell me about yourself and your recent project.
      </div>
      <textarea
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white outline-none resize-none transition-all duration-300"
      />
      <button
        onClick={handleEvaluate}
        className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-300"
      >
        Evaluate answer
      </button>
      {loading && <p className="mt-3 text-sm text-slate-500">AI is analyzing your answer…</p>}
      {score !== null && !loading && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700">Practice score: {score} / 100</p>
          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-600">{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default InterviewPreview;
