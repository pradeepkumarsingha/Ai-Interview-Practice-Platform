import React, { useEffect, useState } from "react";

const INITIAL_STATE = {
  domain: "",
  type: "technical",
  difficulty: "medium",
  question: "",
};

const QuestionsForm = ({ onSave, editingQuestion, onCancelEdit }) => {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (editingQuestion) {
      setForm({
        domain: editingQuestion.domain || "",
        type: editingQuestion.type || "technical",
        difficulty: editingQuestion.difficulty || "medium",
        question: editingQuestion.question || "",
      });
    } else {
      setForm(INITIAL_STATE);
    }
  }, [editingQuestion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    onSave(form);

    if (!editingQuestion) {
      setForm(INITIAL_STATE);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 mb-8 shadow-2xl">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full"></div>

      <div className="relative bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl p-8">
        
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-2">
            {editingQuestion
              ? "✏️ Update Question"
              : "🚀 Create New Question"}
          </h3>

          <p className="text-slate-400">
            Build and manage your interview question bank efficiently.
          </p>
        </div>

        {editingQuestion && (
          <div className="mb-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="text-slate-400 text-sm">
              Editing Question ID:
            </span>
            <p className="font-mono text-indigo-300 text-xs mt-1 break-all">
              {editingQuestion._id}
            </p>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5">

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Domain
            </label>

            <input
              name="domain"
              value={form.domain}
              onChange={handleChange}
              placeholder="React, Java, Python, MERN, AI/ML..."
              required
              className="
                w-full
                bg-slate-900/70
                border border-slate-700
                text-white
                px-5
                py-4
                rounded-2xl
                placeholder:text-slate-500
                focus:outline-none
                focus:ring-2
                focus:ring-violet-500
                focus:border-violet-500
                transition-all duration-300
              "
            />
          </div>

          {/* Type + Difficulty */}
          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Question Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="
                  w-full
                  bg-slate-900/70
                  border border-slate-700
                  text-white
                  px-5
                  py-4
                  rounded-2xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                  transition-all duration-300
                "
              >
                <option value="technical">💻 Technical</option>
                <option value="coding">⚡ Coding</option>
                <option value="behavioral">🧠 Behavioral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="
                  w-full
                  bg-slate-900/70
                  border border-slate-700
                  text-white
                  px-5
                  py-4
                  rounded-2xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-violet-500
                  transition-all duration-300
                "
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Question
            </label>

            <textarea
              name="question"
              value={form.question}
              onChange={handleChange}
              placeholder="Enter interview question..."
              required
              rows="6"
              className="
                w-full
                bg-slate-900/70
                border border-slate-700
                text-white
                px-5
                py-4
                rounded-2xl
                resize-none
                placeholder:text-slate-500
                focus:outline-none
                focus:ring-2
                focus:ring-violet-500
                focus:border-violet-500
                transition-all duration-300
              "
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">

            <button
              type="submit"
              className="
                px-8
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                via-violet-600
                to-purple-600
                text-white
                font-semibold
                shadow-lg
                shadow-violet-500/30
                hover:scale-105
                hover:shadow-violet-500/50
                active:scale-95
                transition-all
                duration-300
              "
            >
              {editingQuestion ? "Update Question" : "Add Question"}
            </button>

            {editingQuestion && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="
                  px-8
                  py-4
                  rounded-2xl
                  bg-slate-800
                  border border-slate-700
                  text-slate-300
                  hover:bg-slate-700
                  hover:text-white
                  transition-all
                  duration-300
                "
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default QuestionsForm;