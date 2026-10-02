import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

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

      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("Fetch instructor results error:", error);
      setError(error.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading results...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-error/20 bg-error/5 p-6">
        <p className="text-sm text-error">{error}</p>
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
      {quizzes.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-violet/10 text-xl">
            📊
          </div>

          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            No quizzes yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Create and publish a quiz to start receiving student results.
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
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="rounded-card border border-border bg-surface p-6 transition hover:border-brand-violet/30"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Quiz information */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-text-primary">
                      {quiz.title}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        quiz.status === "published"
                          ? "bg-success/10 text-success"
                          : quiz.status === "completed"
                          ? "bg-brand-indigo/10 text-brand-indigo"
                          : "bg-background-elevated text-text-secondary"
                      }`}
                    >
                      {quiz.status}
                    </span>

                    <span className="rounded-full bg-brand-violet/10 px-2.5 py-1 text-xs font-medium capitalize text-brand-violet">
                      {quiz.settings?.quizMode || "practice"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-text-secondary">
                    {quiz.description || "No description available."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-muted">
                    <span>
                      {quiz.questions?.length || 0} questions
                    </span>

                    <span>
                      Created{" "}
                      {quiz.createdAt
                        ? new Date(
                            quiz.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </span>

                    {quiz.settings?.quizMode === "test" && (
                      <span>
                        {quiz.resultsShared
                          ? "Results shared"
                          : "Results not shared"}
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
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorResults;