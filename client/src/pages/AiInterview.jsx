import React, { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, CheckCircle2, Clock3, Mic, Send, Square, TimerReset } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { Card, Gauge, PageHeader, PrimaryButton, ProgressBar, SecondaryButton, SkeletonBlock } from "../components/ui";
import { finalEvaluateInterview, startInterview } from "../api/aiService";

const QUESTION_TIME = 60;

const AIInterview = () => {
  const [domain, setDomain] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [interviewState, setInterviewState] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const token = localStorage.getItem("token");

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsRecording(true);
    recognition.onresult = (event) => setAnswer((prev) => `${prev} ${event.results[0][0].transcript}`.trim());
    recognition.onerror = () => setError("Voice input failed. Please try again.");
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const stopInterview = useCallback(() => {
    if (interviewEnded || finalResult) return;
    setInterviewEnded(true);
    setQuestions([]);
    setError("Interview ended because tab switching was detected.");
  }, [finalResult, interviewEnded]);

  const handleFinishInterview = useCallback(async (finalAnswers) => {
    if (interviewEnded) return;
    setLoading(true);
    try {
      const res = await finalEvaluateInterview(questions, finalAnswers, interviewState, questions.length * QUESTION_TIME, token);
      setFinalResult(res.data);
    } catch {
      setError("Evaluation failed.");
    } finally {
      setLoading(false);
    }
  }, [interviewEnded, interviewState, questions, token]);

  const handleNext = useCallback((timeout = false) => {
    if (interviewEnded) return;
    const currentAnswer = timeout || !answer.trim() ? "No answer submitted." : answer;
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setAnswer("");
    if (currentIndex >= questions.length - 1) {
      handleFinishInterview(updatedAnswers);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }, [answer, answers, currentIndex, questions.length, interviewEnded, handleFinishInterview]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && questions.length > 0 && !finalResult) stopInterview();
    };
    const handleWindowBlur = () => {
      if (questions.length > 0 && !finalResult) stopInterview();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [questions.length, finalResult, stopInterview]);

  useEffect(() => {
    if (!questions.length || finalResult || interviewEnded) return;
    if (timeLeft <= 0) {
      handleNext(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions.length, finalResult, interviewEnded, handleNext]);

  useEffect(() => {
    if (!questions.length) return;
    setTimeLeft(QUESTION_TIME);
  }, [currentIndex, questions.length]);

  const handleStart = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setFinalResult(null);
    setAnswer("");
    setInterviewEnded(false);
    try {
      const res = await startInterview(domain, token);
      setQuestions(res.data?.questions || []);
      setInterviewState(res.data?.state || null);
    } catch {
      setError("Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const progress = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="AI interview"
        title="Practice interviews with real-time focus and feedback"
        description="Two-panel interview workspace with question counter, timer, voice input, evaluation status, and final result cards."
      />

      {!questions.length && !finalResult && (
        <Card hover={false}>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-2xl bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                <Bot className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Start a new mock interview</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Choose a domain and receive structured questions with timed progress.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Python, Frontend, Backend, HR..."
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <PrimaryButton onClick={handleStart} disabled={loading || !domain.trim()}>
                {loading ? "Starting" : "Start interview"}
              </PrimaryButton>
            </div>
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
        </Card>
      )}

      {loading && questions.length > 0 && (
        <Card hover={false}>
          <SkeletonBlock className="h-40" />
        </Card>
      )}

      {questions.length > 0 && !finalResult && !interviewEnded && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card hover={false} className="min-h-[360px]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Question panel</h2>
                </div>
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${timeLeft <= 10 ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200" : "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200"}`}>
                  <Clock3 className="h-4 w-4" /> {timeLeft}s
                </div>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-6 text-lg leading-relaxed text-slate-900 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-slate-100">
                {questions[currentIndex]}
              </div>
              <div className="mt-5 rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <TimerReset className="h-4 w-4 text-indigo-500" /> Real-time evaluation indicator
                </p>
                <ProgressBar value={Math.max(100 - timeLeft, 8)} tone={timeLeft <= 10 ? "red" : "indigo"} />
              </div>
            </Card>

            <Card hover={false} className="min-h-[360px]">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Answer panel</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Type or dictate your answer.</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Structure your answer with context, action, result, and learning..."
                className="mt-4 h-56 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SecondaryButton type="button" onClick={startRecording} disabled={isRecording}>
                  <Mic className="h-4 w-4" /> {isRecording ? "Listening" : "Voice input"}
                </SecondaryButton>
                <PrimaryButton onClick={() => handleNext(false)}>
                  {currentIndex >= questions.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {currentIndex >= questions.length - 1 ? "Finish interview" : "Next question"}
                </PrimaryButton>
              </div>
            </Card>
          </div>

          <Card hover={false}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Interview progress tracker</span>
              <span className="font-bold text-slate-950 dark:text-white">{progress}%</span>
            </div>
            <ProgressBar value={progress} tone="green" />
          </Card>
        </div>
      )}

      {interviewEnded && (
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
            <Square className="h-5 w-5 text-red-500" /> Interview ended
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </Card>
      )}

      {finalResult && (
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Card hover={false}>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Final score</h2>
            <div className="py-6">
              <Gauge value={Math.round((finalResult.average_score ?? 7.6) * 10)} label="Score" tone="green" />
            </div>
          </Card>
          <Card hover={false}>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Feedback and recommendations</h2>
            <div className="prose prose-slate mt-4 max-w-none dark:prose-invert">
              <ReactMarkdown>{finalResult.final_feedback || "Strong communication. Add more specific project metrics and trade-off discussion."}</ReactMarkdown>
            </div>
            {Array.isArray(finalResult.suggestions) && finalResult.suggestions.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {finalResult.suggestions.map((suggestion) => (
                  <div key={suggestion} className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardShell>
  );
};

export default AIInterview;
