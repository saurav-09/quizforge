import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Shuffle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function CreateQuizSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  const quizData = location.state;

  const [settings, setSettings] = useState({
    timeLimit: 30,
    attemptsAllowed: 1,
    shuffleQuestions: false,
    showResults: true,
  });

  const [startTime, setStartTime] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleContinue = () => {
    if (!quizData) return;

    if (quizData.quizMode === "test" && !startTime) {
      return;
    }

    navigate("/instructor/quizzes/create/preview", {
      state: {
        ...quizData,
        settings,
        startTime:
          quizData.quizMode === "test" ? startTime : null,
      },
    });
  };

  if (!quizData) {
    return (
      <div className="text-sm text-text-secondary">
        Quiz information not found.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/instructor/quizzes/create/questions"
          state={quizData}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            Quiz Settings
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Configure how students will take this quiz.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          General settings
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Time limit
            </label>

            <div className="relative">
              <Clock3
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                name="timeLimit"
                type="number"
                min="1"
                value={settings.timeLimit}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <p className="mt-1 text-xs text-text-secondary">
              Time in minutes.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Attempts allowed
            </label>

            <input
              name="attemptsAllowed"
              type="number"
              min="1"
              value={settings.attemptsAllowed}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6]"
            />

            <p className="mt-1 text-xs text-text-secondary">
              Maximum attempts per student.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Quiz behavior
        </h3>

        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              name="shuffleQuestions"
              type="checkbox"
              checked={settings.shuffleQuestions}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 accent-[#8B5CF6]"
            />

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Shuffle size={15} />
                Shuffle questions
              </div>

              <p className="mt-1 text-xs text-text-secondary">
                Show questions in a different order for each attempt.
              </p>
            </div>
          </label>

          {quizData.quizMode === "practice" && (
            <label className="flex cursor-pointer items-start gap-3">
              <input
                name="showResults"
                type="checkbox"
                checked={settings.showResults}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 accent-[#8B5CF6]"
              />

              <div>
                <p className="text-sm font-medium text-text-primary">
                  Show results after submission
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  Students can see their score and correct answers.
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      {quizData.quizMode === "test" && (
        <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-text-primary">
            Test schedule
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Set when students can start the test.
          </p>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Starting time
            </label>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6] sm:max-w-sm"
            />

            <p className="mt-1 text-xs text-text-secondary">
              The test will automatically end after the selected time
              limit.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/instructor/quizzes/create/questions"
          state={quizData}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={15} />
          Back
        </Link>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white hover:bg-[#7C3AED]"
        >
          Preview
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default CreateQuizSettings;