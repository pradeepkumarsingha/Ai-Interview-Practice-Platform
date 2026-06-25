import React, { useState, useEffect } from "react";

const FocusSession = () => {
  const [baseMinutes, setBaseMinutes] = useState(35);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tasks, setTasks] = useState(["Science", "Maths", "Coding"]);
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState("Science");
  const [skipBreaks, setSkipBreaks] = useState(false);
  const [status, setStatus] = useState("Not started");

  useEffect(() => {
    let interval;
    if (running && !paused) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setRunning(false);
            alert(skipBreaks ? "🎉 Session completed!" : "☕ Time for a break!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, paused, skipBreaks]);

  const startSession = () => {
    if (running) return;
    setRemainingSeconds(baseMinutes * 60);
    setRunning(true);
    setPaused(false);
    setStatus("Focusing");
  };

  const pauseResume = () => {
    if (!running) return;
    setPaused(!paused);
    setStatus(!paused ? "Paused" : "Focusing");
  };

  const restartSession = () => {
    setRunning(false);
    setPaused(false);
    setRemainingSeconds(0);
    setStatus("Restarted");
  };

  const changeTime = (val) => {
    if (running) return;
    setBaseMinutes(Math.max(10, baseMinutes + val));
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask]);
      setNewTask("");
    }
  };

  const breakCount = baseMinutes >= 90 ? 2 : baseMinutes >= 45 ? 1 : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm shadow-slate-200/40 hover:shadow-lg hover:shadow-slate-200/50 hover:border-indigo-200/80 transition-all duration-300">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">🎧 Focus Session</h3>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => changeTime(-5)}
              disabled={running}
              className="w-10 h-10 rounded-lg border-2 border-slate-300 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-800">{baseMinutes}</div>
              <small className="text-slate-500 text-sm">minutes</small>
            </div>
            <button
              onClick={() => changeTime(5)}
              disabled={running}
              className="w-10 h-10 rounded-lg border-2 border-slate-300 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              +
            </button>
          </div>

          <p className="text-sm text-slate-600 text-center">
            You'll have <strong>{breakCount}</strong> break{breakCount !== 1 ? "s" : ""}
          </p>

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={skipBreaks}
              onChange={(e) => setSkipBreaks(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Skip breaks
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
            >
              {tasks.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={startSession}
              disabled={running}
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ▶ Start
            </button>
            <button
              onClick={pauseResume}
              disabled={!running}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ⏸ {paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={restartSession}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition"
            >
              🔁 Restart
            </button>
          </div>

          <div className="text-center pt-4 border-t border-slate-200">
            <div className="text-5xl font-bold text-indigo-600 mb-2">{formatTime(remainingSeconds)}</div>
            <small className="text-slate-500 text-sm">{status}</small>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-8 text-center">
            <small className="text-slate-600 text-sm">Daily goal</small>
            <h2 className="text-5xl font-bold text-indigo-600 my-2">8</h2>
            <small className="text-slate-600 text-sm">hours</small>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <h4 className="text-2xl font-bold text-slate-800">0</h4>
              <small className="text-slate-600 text-xs">Completed (min)</small>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <h4 className="text-2xl font-bold text-slate-800">0</h4>
              <small className="text-slate-600 text-xs">Streak (days)</small>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">✅ Tasks</h4>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
          <button
            onClick={addTask}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tasks.map((t, i) => (
            <div
              key={i}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium"
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusSession;
