import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
} from "lucide-react";

function InstructorResults() {
  const { getToken } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch("/api/quizzes/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch quizzes"
        );
      }

      setQuizzes(
        Array.isArray(data.quizzes)
          ? data.quizzes
          : []
      );
    } catch (error) {
      console.error(
        "Fetch instructor results error:",
        error
      );

      setError(
        error.message || "Failed to load results"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

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

  const getStatusClasses = (status) => {
    switch (status) {
      case "published":
        return "bg-success/10 text-success";

      case "completed":
        return "bg-brand-indigo/10 text-brand-indigo";

      case "archived":
        return "bg-error/10 text-error";

      default:
        return "bg-background-elevated text-text-secondary";
    }
  };

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

  if (error) {
    return (
      <div className="rounded-card border border-error/20 bg-error/5 p-6">
        <p className="text-sm text-error">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchResults}
          className="mt-4 rounded-button bg-brand-violet px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  /*
   * Results are meaningful for published/completed quizzes.
   * Draft quizzes can still exist in /api/quizzes/my,
   * but they do not have student results yet.
   */
  const resultQuizzes = quizzes.filter(
    (quiz) =>
      quiz.status === "published" ||
      quiz.status === "completed"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-brand-violet">
          Instructor
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
          Results
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          View performance and results for your quizzes.
        </p>
      </div>

      {/* Empty state */}
      {resultQuizzes.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-violet/10">
            <BarChart3
              size={22}
              className="text-brand-violet"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            No results yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Publish a quiz and let students complete
            it to start receiving results.
          </p>

          <Link
            to="/instructor/quizzes/create"
            className="mt-6 inline-flex rounded-button bg-brand-violet px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Create Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {resultQuizzes.map((quiz) => {
            const isTest =
              quiz.settings?.quizMode === "test";

            const isCompleted =
              quiz.status === "completed";

            return (
              <div
                key={quiz._id}
                className="rounded-card border border-border bg-surface p-6 transition hover:border-brand-violet/30"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Quiz information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold text-text-primary">
                        {quiz.title ||
                          "Untitled Quiz"}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                          quiz.status
                        )}`}
                      >
                        {quiz.status ||
                          "unknown"}
                      </span>

                      <span className="rounded-full bg-brand-violet/10 px-2.5 py-1 text-xs font-medium capitalize text-brand-violet">
                        {isTest
                          ? "Test"
                          : "Practice"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                      {quiz.description ||
                        "No description available."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <FileQuestion size={14} />

                        {quiz.questions?.length ||
                          0}{" "}
                        questions
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={14} />

                        Created{" "}
                        {formatDate(
                          quiz.createdAt
                        )}
                      </span>

                      {isTest && (
                        <span
                          className={
                            quiz.resultsShared
                              ? "text-success"
                              : "text-text-muted"
                          }
                        >
                          {quiz.resultsShared
                            ? "Results shared"
                            : "Results not shared"}
                        </span>
                      )}

                      {isCompleted && (
                        <span className="flex items-center gap-1.5 text-success">
                          <CheckCircle2
                            size={14}
                          />

                          Test completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    <Link
                      to={`/instructor/results/${quiz._id}`}
                      className="inline-flex w-full items-center justify-center rounded-button bg-brand-violet px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:w-auto"
                    >
                      View Results
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InstructorResults;