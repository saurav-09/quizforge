import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  FileQuestion,
  Play,
  Loader2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

function StudentQuizDetails() {
  const { quizId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const response = await fetch(
          `/api/quizzes/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load quiz"
          );
        }

        setQuiz(data.quiz || null);
      } catch (error) {
        console.error(
          "Fetch quiz details error:",
          error
        );

        setError(
          error.message || "Failed to load quiz"
        );
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, getToken]);

  const startQuiz = async () => {
    if (!quizId || starting) {
      return;
    }

    try {
      setStarting(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        `/api/quiz-attempts/${quizId}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to start quiz"
        );
      }

      if (!data.attemptId) {
        throw new Error(
          "Quiz attempt could not be created."
        );
      }

      /*
       * Backend can either create a new attempt
       * or resume an existing attempt.
       */
      navigate(
        `/student/quizzes/${quizId}/attempt/${data.attemptId}`,
        {
          state: {
            quiz: data.quiz,
            startedAt: data.startedAt,
            deadline: data.deadline,
            answers: data.answers || {},
          },
        }
      );
    } catch (error) {
      console.error(
        "Start quiz error:",
        error
      );

      setError(
        error.message || "Failed to start quiz"
      );
    } finally {
      setStarting(false);
    }
  };

  const formatTime = (minutes) => {
    const safeMinutes = Number(minutes);

    if (
      !Number.isFinite(safeMinutes) ||
      safeMinutes <= 0
    ) {
      return "No time limit";
    }

    if (safeMinutes < 60) {
      return `${safeMinutes} min`;
    }

    const hours = Math.floor(
      safeMinutes / 60
    );

    const remainingMinutes =
      safeMinutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading quiz...
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load quiz
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            to="/student/quizzes"
            className="mt-6 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-text-primary">
            Quiz not found
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            This quiz is no longer available.
          </p>

          <Link
            to="/student/quizzes"
            className="mt-6 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const settings = quiz.settings || {};

  const isTest =
    settings.quizMode === "test";

  const questionCount =
    Array.isArray(quiz.questions)
      ? quiz.questions.length
      : 0;

  /*
   * Test scheduling
   */
  const now = new Date();

  const startDate = quiz.startTime
    ? new Date(quiz.startTime)
    : null;

  const endDate = quiz.endTime
    ? new Date(quiz.endTime)
    : null;

  const validStartDate =
    startDate &&
    !Number.isNaN(startDate.getTime());

  const validEndDate =
    endDate &&
    !Number.isNaN(endDate.getTime());

  const hasStarted =
    !isTest ||
    !validStartDate ||
    now >= startDate;

  const hasEnded =
    isTest &&
    validEndDate &&
    now >= endDate;

  const isUpcoming =
    isTest && !hasStarted;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      {/* Back */}
      <Link
        to="/student/quizzes"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Back to Quizzes
      </Link>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-border bg-surface p-6 sm:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-semibold text-brand-violet">
                {isTest ? "Test" : "Practice"}
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                Published
              </span>

              {isTest && isUpcoming && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  Upcoming
                </span>
              )}

              {isTest && hasEnded && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  Ended
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
              {quiz.title || "Untitled Quiz"}
            </h1>

            {quiz.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                {quiz.description}
              </p>
            )}
          </div>
        </div>

        {/* Quiz Information */}
        <div className="grid border-b border-border sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-border p-5 sm:border-b-0 sm:border-r">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet">
              <FileQuestion size={19} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Questions
              </p>

              <p className="mt-1 text-sm font-semibold text-text-primary">
                {questionCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-border p-5 sm:border-b-0 sm:border-r">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Time Limit
              </p>

              <p className="mt-1 text-sm font-semibold text-text-primary">
                {formatTime(settings.timeLimit)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <span className="text-sm font-bold">
                #
              </span>
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Attempts
              </p>

              <p className="mt-1 text-sm font-semibold text-text-primary">
                {settings.attemptsAllowed || 1}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-text-primary">
            Before you begin
          </h2>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-violet" />

              <span>
                Your answers are automatically
                saved while you attempt the quiz.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-violet" />

              <span>
                The timer starts when you start
                the quiz.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-violet" />

              <span>
                The quiz is automatically submitted
                when the time expires.
              </span>
            </li>

            {isTest ? (
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-violet" />

                <span>
                  Your test result will be available
                  according to the instructor's
                  result sharing settings.
                </span>
              </li>
            ) : (
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-violet" />

                <span>
                  Your practice score will be shown
                  immediately after submission.
                </span>
              </li>
            )}
          </ul>

          {/* Schedule Information */}
          {isTest && quiz.startTime && (
            <div className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              {isUpcoming && (
                <p className="text-blue-600">
                  Test starts on{" "}
                  <span className="font-semibold">
                    {formatDateTime(
                      quiz.startTime
                    )}
                  </span>
                </p>
              )}

              {hasStarted && !hasEnded && (
                <p className="text-emerald-600">
                  Test is currently available.
                </p>
              )}

              {hasEnded && (
                <p className="text-text-secondary">
                  This test ended on{" "}
                  <span className="font-semibold">
                    {formatDateTime(
                      quiz.endTime
                    )}
                  </span>
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Start */}
          <div className="mt-8 flex justify-end">
            {hasEnded ? (
              <div className="w-full rounded-[10px] bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-text-secondary sm:w-auto">
                Test has ended
              </div>
            ) : isUpcoming ? (
              <div className="w-full rounded-[10px] bg-blue-50 px-6 py-3 text-center text-sm font-semibold text-blue-600 sm:w-auto">
                Test has not started yet
              </div>
            ) : (
              <button
                type="button"
                onClick={startQuiz}
                disabled={starting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-violet px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {starting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={17} />
                    Start Quiz
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentQuizDetails;