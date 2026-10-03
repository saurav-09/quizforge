import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useAuthContext } from "../../context/AuthContext";

function StudentDashboard() {
  const { getToken } = useAuth();
  const { user } = useAuthContext();

  const [results, setResults] = useState([]);
  const [quizCount, setQuizCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        /*
         * Fetch available quizzes and completed results
         * together.
         */
        const [quizResponse, resultResponse] =
          await Promise.all([
            fetch("/api/quizzes/available", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch("/api/quiz-attempts/my", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const quizData =
          await quizResponse.json();

        const resultData =
          await resultResponse.json();

        if (!quizResponse.ok) {
          throw new Error(
            quizData.message ||
              "Failed to load quizzes"
          );
        }

        if (!resultResponse.ok) {
          throw new Error(
            resultData.message ||
              "Failed to load results"
          );
        }

        setQuizCount(
          quizData.quizzes?.length || 0
        );

        /*
         * API already sorts results by newest
         * submission first.
         *
         * Only show the latest 3.
         */
        setResults(
          (resultData.results || []).slice(
            0,
            3
          )
        );
      } catch (error) {
        console.error(
          "Fetch student dashboard data error:",
          error
        );

        setError(
          error.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getToken]);

  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(" ")[0];
    }

    return "Student";
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

  const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
  };

  const formatTime = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "—";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes === 0) {
      return `${seconds}s`;
    }

    return `${minutes} min`;
  };

  /*
   * Calculate a simple average only from
   * results whose scores are available.
   */
  const availableResults =
    results.filter(
      (result) =>
        result.resultAvailable &&
        result.percentage !== null &&
        result.percentage !== undefined
    );

  const averagePercentage =
    availableResults.length > 0
      ? Math.round(
          availableResults.reduce(
            (total, result) =>
              total +
              Number(
                result.percentage || 0
              ),
            0
          ) /
            availableResults.length
        )
      : null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ------------------------------------------------ */}
      {/* Header                                           */}
      {/* ------------------------------------------------ */}

      <div>
        <p className="text-sm font-medium text-brand-violet">
          Student Dashboard
        </p>

        <h1 className="mt-1 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
          Welcome back,{" "}
          {getFirstName()} 👋
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Continue learning, take quizzes, and
          track your performance.
        </p>
      </div>

      {/* ------------------------------------------------ */}
      {/* Error                                            */}
      {/* ------------------------------------------------ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Stats                                             */}
      {/* ------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Available Quizzes */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet">
              <BookOpen size={20} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Available Quizzes
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-text-primary">
                {quizCount}
              </p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Recent Attempts
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-text-primary">
                {results.length}
              </p>
            </div>
          </div>
        </div>

        {/* Average */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Award size={20} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Recent Average
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-text-primary">
                {averagePercentage !==
                null
                  ? `${averagePercentage}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Quick actions                                    */}
      {/* ------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/student/quizzes"
          className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet">
              <FileQuestion size={20} />
            </div>

            <ArrowRight
              size={18}
              className="text-text-muted transition group-hover:translate-x-1 group-hover:text-brand-violet"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-text-primary">
            Browse Quizzes
          </h2>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Find available quizzes and test your
            knowledge.
          </p>
        </Link>

        <Link
          to="/student/results"
          className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award size={20} />
            </div>

            <ArrowRight
              size={18}
              className="text-text-muted transition group-hover:translate-x-1 group-hover:text-emerald-600"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-text-primary">
            View My Results
          </h2>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Review your quiz attempts and detailed
            performance.
          </p>
        </Link>
      </div>

      {/* ------------------------------------------------ */}
      {/* Recent Results                                   */}
      {/* ------------------------------------------------ */}

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Recent Results
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Your latest completed quiz attempts.
            </p>
          </div>

          {results.length > 0 && (
            <Link
              to="/student/results"
              className="hidden items-center gap-1.5 text-sm font-semibold text-brand-violet transition hover:opacity-80 sm:inline-flex"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-violet/10">
                <Award
                  size={22}
                  className="text-brand-violet"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-text-primary">
                No completed quizzes yet
              </h3>

              <p className="mt-1 text-sm text-text-secondary">
                Complete your first quiz to see your
                result here.
              </p>

              <Link
                to="/student/quizzes"
                className="mt-5 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Browse Quizzes
              </Link>
            </div>
          ) : (
            results.map((item) => {
              const isTest =
                item.quiz?.quizMode ===
                "test";

              const resultAvailable =
                item.resultAvailable !== false;

              return (
                <div
                  key={item.attemptId}
                  className="rounded-2xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-violet/10 px-2.5 py-1 text-[11px] font-semibold text-brand-violet">
                          {isTest
                            ? "Test"
                            : "Practice"}
                        </span>

                        {resultAvailable ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                            Result Available
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Result Pending
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 truncate text-base font-semibold text-text-primary">
                        {item.quiz?.title ||
                          "Quiz unavailable"}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span>
                          {formatDate(
                            item.submittedAt
                          )}
                        </span>

                        {resultAvailable &&
                          item.timeTaken !==
                            null &&
                          item.timeTaken !==
                            undefined && (
                            <span className="flex items-center gap-1">
                              <Clock3
                                size={13}
                              />
                              {formatTime(
                                item.timeTaken
                              )}
                            </span>
                          )}
                      </div>
                    </div>

                    {resultAvailable ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-text-muted">
                            Score
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-text-primary">
                            {item.score}
                            <span className="font-normal text-text-muted">
                              /
                              {
                                item.totalPoints
                              }
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-text-muted">
                            Result
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-brand-violet">
                            {Math.round(
                              item.percentage ||
                                0
                            )}
                            %
                          </p>
                        </div>

                        <Link
                          to={`/student/results/${item.attemptId}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-violet text-white transition hover:opacity-90"
                          title="View result"
                        >
                          <ArrowRight
                            size={16}
                          />
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to={`/student/results/${item.attemptId}`}
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3.5 py-2 text-xs font-semibold text-text-primary transition hover:bg-surface"
                      >
                        View Status
                        <ArrowRight
                          size={14}
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mobile view all */}
        {results.length > 0 && (
          <Link
            to="/student/results"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-violet sm:hidden"
          >
            View all results
            <ArrowRight size={15} />
          </Link>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;