import { useEffect, useState } from "react";
import {
  Clock3,
  FileQuestion,
  Play,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

function StudentQuizzes() {
  const { getToken } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        "/api/quizzes/available",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load quizzes"
        );
      }

      setQuizzes(
        Array.isArray(data.quizzes)
          ? data.quizzes
          : []
      );
    } catch (error) {
      console.error(
        "Fetch available quizzes error:",
        error
      );

      setError(
        error.message || "Failed to load quizzes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

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
        <p className="text-sm text-text-secondary">
          Loading quizzes...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-error">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchQuizzes}
          className="mt-4 inline-flex items-center gap-2 rounded-button border border-border px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-hover hover:bg-background-elevated"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          Available Quizzes
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Choose a quiz and test your knowledge.
        </p>
      </div>

      {/* Empty State */}
      {quizzes.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background-elevated">
            <FileQuestion
              size={22}
              className="text-text-secondary"
            />
          </div>

          <h3 className="mt-4 text-base font-semibold text-text-primary">
            No quizzes available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            There are no published quizzes available
            right now. Check back later for new
            quizzes.
          </p>
        </div>
      ) : (
        /* Quiz Grid */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => {
            const questionCount =
              Array.isArray(quiz.questions)
                ? quiz.questions.length
                : 0;

            const mode =
              quiz.settings?.quizMode ||
              "practice";

            const timeLimit =
              Number(
                quiz.settings?.timeLimit
              ) || 0;

            const isTest = mode === "test";

            const now = new Date();

            const startTime = quiz.startTime
              ? new Date(quiz.startTime)
              : null;

            const isUpcoming =
              isTest &&
              startTime &&
              !Number.isNaN(
                startTime.getTime()
              ) &&
              now < startTime;

            return (
              <div
                key={quiz._id}
                className="flex flex-col rounded-card border border-border bg-surface p-5 transition hover:-translate-y-1 hover:border-border-hover hover:shadow-lg"
              >
                {/* Mode */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      isTest
                        ? "bg-blue-50 text-blue-600"
                        : "bg-violet-50 text-violet-600"
                    }`}
                  >
                    {isTest
                      ? "Test"
                      : "Practice"}
                  </span>

                  <span className="text-xs text-text-muted">
                    Published
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4 flex-1">
                  <h3 className="line-clamp-2 text-lg font-semibold text-text-primary">
                    {quiz.title ||
                      "Untitled Quiz"}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                    {quiz.description ||
                      "No description provided."}
                  </p>
                </div>

                {/* Quiz Info */}
                <div className="mt-5 space-y-3 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <FileQuestion size={14} />

                      {questionCount}{" "}
                      {questionCount === 1
                        ? "Question"
                        : "Questions"}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Clock3 size={14} />

                      {timeLimit > 0
                        ? `${timeLimit} min`
                        : "No limit"}
                    </div>
                  </div>

                  {/* Test Schedule */}
                  {isTest &&
                    quiz.startTime && (
                      <div className="rounded-xl bg-background-elevated px-3 py-2.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                          Test Starts
                        </p>

                        <p className="mt-1 text-xs font-medium text-text-primary">
                          {formatDateTime(
                            quiz.startTime
                          )}
                        </p>

                        {isUpcoming && (
                          <p className="mt-1 text-xs text-brand-violet">
                            This test has not started yet.
                          </p>
                        )}
                      </div>
                    )}
                </div>

                {/* Action */}
                <Link
                  to={`/student/quizzes/${quiz._id}`}
                  className={`mt-5 flex items-center justify-center gap-2 rounded-button px-4 py-2.5 text-sm font-medium text-white transition ${
                    isUpcoming
                      ? "bg-brand-indigo hover:opacity-90"
                      : "bg-brand-violet hover:bg-brand-indigo"
                  }`}
                >
                  <Play size={15} />

                  {isUpcoming
                    ? "View Quiz"
                    : "Start Quiz"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentQuizzes;