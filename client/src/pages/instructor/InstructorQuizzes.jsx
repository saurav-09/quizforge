import { useEffect, useState } from "react";
import {
  Clock3,
  FileQuestion,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

function InstructorQuizzes() {
  const { getToken } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [error, setError] = useState("");

  const fetchQuizzes = async () => {
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
        throw new Error(data.message || "Failed to load quizzes");
      }

      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("Fetch instructor quizzes error:", error);
      setError(error.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handlePublish = async (quizId) => {
    try {
      setPublishingId(quizId);
      setError("");

      const token = await getToken();

      const response = await fetch(`/api/quizzes/${quizId}/publish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish quiz");
      }

      setQuizzes((currentQuizzes) =>
        currentQuizzes.map((quiz) =>
          quiz._id === quizId
            ? { ...quiz, status: "published" }
            : quiz
        )
      );
    } catch (error) {
      console.error("Publish quiz error:", error);
      setError(error.message || "Failed to publish quiz");
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            My Quizzes
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Create, manage, and publish your quizzes.
          </p>
        </div>

        <Link
          to="/instructor/quizzes/create"
          className="inline-flex items-center justify-center gap-2 rounded-button bg-brand-violet px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo"
        >
          <Play size={15} />
          Create Quiz
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{error}</p>

          <button
            type="button"
            onClick={fetchQuizzes}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-text-primary hover:text-brand-violet"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

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
            No quizzes yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Create your first quiz to start assessing your students.
          </p>

          <Link
            to="/instructor/quizzes/create"
            className="mt-5 inline-flex items-center gap-2 rounded-button bg-brand-violet px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo"
          >
            Create Quiz
          </Link>
        </div>
      ) : (
        /* Quiz Grid */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => {
            const questionCount = quiz.questions?.length || 0;
            const timeLimit = quiz.settings?.timeLimit || 0;
            const mode = quiz.settings?.quizMode || "practice";

            return (
              <div
                key={quiz._id}
                className="flex flex-col rounded-card border border-border bg-surface p-5 transition hover:-translate-y-1 hover:border-border-hover hover:shadow-lg"
              >
                {/* Top */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      quiz.status === "published"
                        ? "bg-emerald-50 text-emerald-600"
                        : quiz.status === "archived"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {quiz.status === "published"
                      ? "Published"
                      : quiz.status === "archived"
                      ? "Archived"
                      : "Draft"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      mode === "test"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-violet-50 text-violet-600"
                    }`}
                  >
                    {mode === "test" ? "Test" : "Practice"}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4 flex-1">
                  <h3 className="line-clamp-2 text-lg font-semibold text-text-primary">
                    {quiz.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                    {quiz.description || "No description provided."}
                  </p>
                </div>

                {/* Info */}
                <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <FileQuestion size={14} />
                    {questionCount}{" "}
                    {questionCount === 1 ? "Question" : "Questions"}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock3 size={14} />
                    {timeLimit} min
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  {quiz.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => handlePublish(quiz._id)}
                      disabled={publishingId === quiz._id}
                      className="flex-1 rounded-button bg-brand-violet px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {publishingId === quiz._id
                        ? "Publishing..."
                        : "Publish"}
                    </button>
                  )}

                  <Link
                    to={`/instructor/quizzes/create?quizId=${quiz._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-button border border-border px-3 py-2.5 text-sm font-medium text-text-primary transition hover:border-border-hover hover:bg-background-elevated"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-button border border-border px-3 py-2.5 text-text-secondary transition hover:border-error/30 hover:bg-error/5 hover:text-error"
                    title="Delete quiz"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InstructorQuizzes;