import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

function StudentResults() {
  const { getToken } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const response = await fetch(
          "/api/quiz-attempts/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load results"
          );
        }

        setResults(data.results || []);
      } catch (error) {
        console.error(
          "Fetch student results error:",
          error
        );

        setError(
          error.message ||
            "Failed to load results"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [getToken]);

  const formatTime = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "—";
    }

    const safeSeconds = Math.max(
      0,
      seconds
    );

    const hours = Math.floor(
      safeSeconds / 3600
    );

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes} min`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * -------------------------------------------------------
   * Loading
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2
            size={18}
            className="animate-spin"
          />

          Loading results...
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Error
   * -------------------------------------------------------
   */

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load results
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Empty state
   * -------------------------------------------------------
   */

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            My Results
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            View your completed quiz attempts and
            performance.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-violet/10">
            <Award
              size={26}
              className="text-brand-violet"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-text-primary">
            No results yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Complete a quiz to see your score and
            detailed performance here.
          </p>

          <Link
            to="/student/quizzes"
            className="mt-6 inline-flex rounded-[10px] bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Results
   * -------------------------------------------------------
   */

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          My Results
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          View your completed quiz attempts and
          performance.
        </p>
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <CheckCircle2
          size={17}
          className="text-emerald-600"
        />

        <span>
          {results.length} completed{" "}
          {results.length === 1
            ? "attempt"
            : "attempts"}
        </span>
      </div>

      {/* Result cards */}
      <div className="space-y-4">
        {results.map((item) => {
          const isTest =
            item.quiz?.quizMode ===
            "test";

          const resultAvailable =
            item.resultAvailable !== false;

          return (
            <div
              key={item.attemptId}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Quiz information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-violet/10 px-2.5 py-1 text-xs font-semibold text-brand-violet">
                      {isTest
                        ? "Test"
                        : "Practice"}
                    </span>

                    {resultAvailable ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        Result Available
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Result Pending
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 truncate text-lg font-semibold text-text-primary">
                    {item.quiz?.title ||
                      "Quiz unavailable"}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={14} />

                      {formatDate(
                        item.submittedAt
                      )}
                    </span>

                    {resultAvailable &&
                      item.timeTaken !==
                        null &&
                      item.timeTaken !==
                        undefined && (
                        <span>
                          Time:{" "}
                          {formatTime(
                            item.timeTaken
                          )}
                        </span>
                      )}
                  </div>
                </div>

                {/* Result stats */}
                {resultAvailable ? (
                  <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center">
                    <div className="min-w-[90px] rounded-xl bg-surface px-4 py-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-text-muted">
                        Score
                      </p>

                      <p className="mt-1 text-sm font-bold text-text-primary">
                        {item.score}
                        <span className="font-normal text-text-muted">
                          /
                          {
                            item.totalPoints
                          }
                        </span>
                      </p>
                    </div>

                    <div className="min-w-[90px] rounded-xl bg-brand-violet/5 px-4 py-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-text-muted">
                        Result
                      </p>

                      <p className="mt-1 text-sm font-bold text-brand-violet">
                        {Math.round(
                          item.percentage ||
                            0
                        )}
                        %
                      </p>
                    </div>

                    <Link
                      to={`/student/results/${item.attemptId}`}
                      className="flex min-w-[90px] items-center justify-center gap-1.5 rounded-xl bg-brand-violet px-4 py-3 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      View
                      <ArrowRight
                        size={14}
                      />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-xl bg-amber-50 px-4 py-3">
                      <p className="text-sm font-semibold text-amber-700">
                        Waiting for instructor
                      </p>

                      <p className="mt-1 text-xs text-amber-600">
                        Your result has not been
                        released yet.
                      </p>
                    </div>

                    <Link
                      to={`/student/results/${item.attemptId}`}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-4 py-2.5 text-xs font-semibold text-text-primary transition hover:bg-surface"
                    >
                      View Status
                      <ArrowRight
                        size={14}
                      />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentResults;