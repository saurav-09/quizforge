import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

function StudentQuizResult() {
  const { attemptId } = useParams();
  const { getToken } = useAuth();

  const [result, setResult] = useState(null);
  const [resultAvailable, setResultAvailable] =
    useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const response = await fetch(
          `/api/quiz-attempts/${attemptId}/result`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load result"
          );
        }

        const available =
          data.resultAvailable !== false;

        setResultAvailable(available);

        if (available) {
          setResult(data.result || null);
        } else {
          setResult(null);
        }
      } catch (error) {
        console.error(
          "Fetch result error:",
          error
        );

        setError(
          error.message || "Failed to load result"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, getToken]);

  const formatTime = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "—";
    }

    const totalSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading result...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load result
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            to="/student/results"
            className="mt-6 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Test result waiting screen
   * -------------------------------------------------------
   */

  if (!resultAvailable) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Link
          to="/student/results"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back to Results
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-violet/10">
            <Clock3
              size={27}
              className="text-brand-violet"
            />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary">
            Result not released yet
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
            Your test has been submitted successfully.
            The instructor has not released the result
            yet.
          </p>

          <Link
            to="/student/results"
            className="mt-7 inline-flex rounded-[10px] bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-text-primary">
            Result not available
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            The result data could not be found.
          </p>

          <Link
            to="/student/results"
            className="mt-6 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Result data
   * -------------------------------------------------------
   */

  const percentage = Math.round(
    Number(result.percentage) || 0
  );

  const questions = Array.isArray(
    result.questions
  )
    ? result.questions
    : [];

  /*
   * Backend returns quizMode directly inside
   * result.quiz.
   */
  const isTest =
    result.quiz?.quizMode === "test";

  const correctCount =
    questions.filter(
      (question) => question.isCorrect
    ).length;

  const incorrectCount =
    questions.filter(
      (question) =>
        !question.isCorrect &&
        question.selectedAnswer
    ).length;

  const unansweredCount =
    questions.filter(
      (question) =>
        !question.selectedAnswer
    ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back */}
      <Link
        to="/student/results"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Back to Results
      </Link>

      {/* Result Header */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="bg-gradient-to-br from-brand-violet/10 via-white to-brand-indigo/10 p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-semibold text-brand-violet">
                  {isTest
                    ? "Test"
                    : "Practice"}
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  Completed
                </span>
              </div>

              <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                {result.quiz?.title}
              </h1>

              {result.quiz?.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                  {result.quiz.description}
                </p>
              )}

              <p className="mt-4 text-xs text-text-muted">
                Submitted{" "}
                {formatDate(
                  result.submittedAt
                )}
              </p>
            </div>

            {/* Percentage */}
            <div className="shrink-0 text-center md:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Percentage
              </p>

              <p className="mt-1 font-display text-5xl font-bold text-brand-violet">
                {percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid border-t border-border sm:grid-cols-4">
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs text-text-muted">
              Score
            </p>

            <p className="mt-1 text-lg font-semibold text-text-primary">
              {result.score}
              <span className="text-sm font-normal text-text-muted">
                {" "}
                / {result.totalPoints}
              </span>
            </p>
          </div>

          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs text-text-muted">
              Correct
            </p>

            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {correctCount}
            </p>
          </div>

          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs text-text-muted">
              Incorrect
            </p>

            <p className="mt-1 text-lg font-semibold text-red-600">
              {incorrectCount}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs text-text-muted">
              Time Taken
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-text-primary">
              <Clock3 size={16} />
              {formatTime(
                result.timeTaken
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Question statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={20}
              className="text-emerald-600"
            />

            <div>
              <p className="text-xs text-emerald-700">
                Correct
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-700">
                {correctCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <XCircle
              size={20}
              className="text-red-600"
            />

            <div>
              <p className="text-xs text-red-700">
                Incorrect
              </p>

              <p className="mt-1 text-xl font-bold text-red-700">
                {incorrectCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-400 text-[9px] font-bold text-slate-500">
              —
            </div>

            <div>
              <p className="text-xs text-text-secondary">
                Unanswered
              </p>

              <p className="mt-1 text-xl font-bold text-text-primary">
                {unansweredCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Question Review
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Review your answers and understand
            where you gained or lost points.
          </p>
        </div>

        <div className="divide-y divide-border">
          {questions.map(
            (question, index) => {
              const unanswered =
                !question.selectedAnswer;

              return (
                <div
                  key={
                    question.questionId ||
                    index
                  }
                  className="p-6 sm:p-8"
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        question.isCorrect
                          ? "bg-emerald-50 text-emerald-600"
                          : unanswered
                          ? "bg-slate-100 text-slate-500"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {question.isCorrect ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <XCircle size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-text-muted">
                          Question {index + 1}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            question.isCorrect
                              ? "bg-emerald-50 text-emerald-600"
                              : unanswered
                              ? "bg-slate-100 text-slate-500"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {question.pointsEarned || 0}{" "}
                          /{" "}
                          {question.points || 0}{" "}
                          points
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-semibold leading-7 text-text-primary">
                        {question.question}
                      </h3>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mt-5 space-y-2">
                    {question.options?.map(
                      (
                        option,
                        optionIndex
                      ) => {
                        const isSelected =
                          question.selectedAnswer ===
                          option;

                        const isCorrect =
                          question.correctAnswer ===
                          option;

                        let optionClass =
                          "border-border bg-white text-text-secondary";

                        if (isCorrect) {
                          optionClass =
                            "border-emerald-200 bg-emerald-50 text-emerald-700";
                        } else if (
                          isSelected
                        ) {
                          optionClass =
                            "border-red-200 bg-red-50 text-red-700";
                        }

                        return (
                          <div
                            key={`${question.questionId}-${optionIndex}`}
                            className={`flex items-center gap-3 rounded-xl border p-3.5 ${optionClass}`}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-semibold">
                              {String.fromCharCode(
                                65 +
                                  optionIndex
                              )}
                            </span>

                            <span className="text-sm">
                              {option}
                            </span>

                            <div className="ml-auto flex items-center gap-2">
                              {isSelected && (
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold">
                                  Your answer
                                </span>
                              )}

                              {isCorrect && (
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        Explanation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/student/results"
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface"
        >
          <ArrowLeft size={16} />
          All Results
        </Link>

        <Link
          to="/student/quizzes"
          className="inline-flex items-center justify-center rounded-[10px] bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Browse More Quizzes
        </Link>
      </div>
    </div>
  );
}

export default StudentQuizResult;