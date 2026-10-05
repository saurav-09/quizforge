import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Shuffle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

function CreateQuizSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

 const quizData = location.state || {};

const searchParams = new URLSearchParams(
  location.search
);

const quizId =
  searchParams.get("quizId") ||
  quizData.quizId;

  const isEditMode = Boolean(quizId);

  const [settings, setSettings] = useState({
    timeLimit: 30,
    attemptsAllowed: 1,
    shuffleQuestions: false,
  });

  const [startTime, setStartTime] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    const fetchQuizSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const response = await fetch(`/api/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load quiz settings"
          );
        }

        const quiz = data.quiz;
        const existingSettings = quiz.settings || {};

        setSettings({
          timeLimit: existingSettings.timeLimit || 30,
          attemptsAllowed:
            existingSettings.attemptsAllowed || 1,
          shuffleQuestions:
            existingSettings.shuffleQuestions || false,
        });

        if (quiz.startTime) {
          const date = new Date(quiz.startTime);

          const localDateTime = new Date(
            date.getTime() -
              date.getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16);

          setStartTime(localDateTime);
        }
      } catch (error) {
        console.error(
          "Fetch quiz settings error:",
          error
        );

        setError(
          error.message || "Failed to load quiz settings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizSettings();
  }, [quizId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : Number(value),
    }));
  };

const handleContinue = () => {
  if (!quizData) {
    return;
  }

  if (
    quizData.quizMode === "test" &&
    !startTime
  ) {
    setError(
      "Please select a test starting time."
    );
    return;
  }

  if (
    settings.timeLimit < 1 ||
    settings.attemptsAllowed < 1
  ) {
    setError(
      "Time limit and attempts allowed must be at least 1."
    );
    return;
  }

  setError("");

  const params = new URLSearchParams();

  if (quizId) {
    params.set("quizId", quizId);
  }

  navigate(
    `/instructor/quizzes/create/preview${
      params.toString()
        ? `?${params.toString()}`
        : ""
    }`,
    {
      state: {
        ...quizData,
        settings,
        startTime:
          quizData.quizMode === "test"
            ? startTime
            : null,
        quizId,
        isEditMode,
      },
    }
  );
};

  if (!quizData) {
    return (
      <div className="text-sm text-text-secondary">
        Quiz information not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
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
            {isEditMode ? "Edit Quiz Settings" : "Quiz Settings"}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Configure how students will take this quiz.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* General Settings */}
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

      {/* Quiz Behavior */}
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

         
        </div>
      </div>

      {/* Test Schedule */}
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
              onChange={(e) =>
                setStartTime(e.target.value)
              }
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6] sm:max-w-sm"
            />

            <p className="mt-1 text-xs text-text-secondary">
              The test will automatically end after the selected time limit.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
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