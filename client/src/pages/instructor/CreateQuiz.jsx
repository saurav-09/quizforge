import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function CreateQuiz() {
  const navigate = useNavigate();

  const [quizMode, setQuizMode] = useState("practice");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinue = () => {
    if (!formData.title.trim()) {
      return;
    }

    navigate("/instructor/quizzes/create/questions", {
      state: {
        ...formData,
        quizMode,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/instructor/quizzes"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            Create Quiz
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Create a new quiz for your students.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Quiz type
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Choose how students will experience this quiz.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setQuizMode("practice")}
            className={`rounded-xl border p-4 text-left transition-colors ${
              quizMode === "practice"
                ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                : "border-border hover:bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Practice
                </h4>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Students can see their score, correct answers, and
                  explanations after submission.
                </p>
              </div>

              {quizMode === "practice" && (
                <Check
                  size={17}
                  className="shrink-0 text-[#8B5CF6]"
                />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setQuizMode("test")}
            className={`rounded-xl border p-4 text-left transition-colors ${
              quizMode === "test"
                ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                : "border-border hover:bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Test
                </h4>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Students only see a submission confirmation. Results
                  are shared by the instructor later.
                </p>
              </div>

              {quizMode === "test" && (
                <Check
                  size={17}
                  className="shrink-0 text-[#8B5CF6]"
                />
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Basic information
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Quiz title
            </label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Java OOP Basics"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe this quiz..."
              className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-[#8B5CF6]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/instructor/quizzes"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={15} />
          Cancel
        </Link>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!formData.title.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default CreateQuiz;