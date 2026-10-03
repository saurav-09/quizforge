import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Loader2,
  Mail,
} from "lucide-react";

function InstructorQuizResults() {
  const { quizId } = useParams();
  const { getToken } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");
  const [showShareConfirm, setShowShareConfirm] =
    useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        `/api/quizzes/${quizId}/results`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch quiz results"
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "Fetch quiz results error:",
        error
      );

      setError(
        error.message ||
          "Failed to load quiz results"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const shareResults = async () => {
    try {
      setSharing(true);
      setShareMessage("");
      setShareError("");

      const token = await getToken();

      const response = await fetch(
        `/api/quizzes/${quizId}/share-results`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to share results"
        );
      }

      if (result.resultsShared) {
        setShareMessage(
          `Results shared successfully. ${
            result.sent || 0
          } email${
            result.sent === 1 ? "" : "s"
          } sent${
            result.failed > 0
              ? `, ${result.failed} failed`
              : ""
          }.`
        );
      } else {
        setShareError(
          `No result emails were sent. ${
            result.failed || 0
          } email${
            result.failed === 1 ? "" : "s"
          } failed.`
        );
      }

      setShowShareConfirm(false);

      await fetchResults();
    } catch (error) {
      console.error(
        "Share quiz results error:",
        error
      );

      setShareError(
        error.message ||
          "Failed to share results"
      );
    } finally {
      setSharing(false);
    }
  };

  const formatTime = (seconds) => {
    const safeSeconds = Number(seconds);

    if (
      !Number.isFinite(safeSeconds) ||
      safeSeconds < 0
    ) {
      return "0 min";
    }

    const roundedSeconds = Math.floor(
      safeSeconds
    );

    const hours = Math.floor(
      roundedSeconds / 3600
    );

    const minutes = Math.floor(
      (roundedSeconds % 3600) / 60
    );

    const remainingSeconds =
      roundedSeconds % 60;

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

  if (!data) {
    return null;
  }

  const quiz = data.quiz || {};
  const analytics = data.analytics || {};
  const results = Array.isArray(data.results)
    ? data.results
    : [];

  const totalAttempts =
    Number(analytics.totalAttempts) || 0;

  const averagePercentage =
    Number(analytics.averagePercentage) || 0;

  const highestPercentage =
    Number(analytics.highestPercentage) || 0;

  const lowestPercentage =
    Number(analytics.lowestPercentage) || 0;

  const isTest =
    quiz.quizMode === "test";

  const canShareResults =
    isTest &&
    quiz.status === "completed" &&
    !quiz.resultsShared &&
    results.length > 0 &&
    !sharing;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/instructor/results"
          className="text-sm font-medium text-brand-violet hover:underline"
        >
          ← Back to Results
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-violet">
              Quiz Results
            </p>

            <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-text-primary">
              {quiz.title || "Untitled Quiz"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {quiz.description ||
                "View student performance for this quiz."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-medium capitalize text-brand-violet">
                {quiz.quizMode || "practice"}
              </span>

              <span className="rounded-full bg-background-elevated px-3 py-1 text-xs font-medium capitalize text-text-secondary">
                {quiz.status || "unknown"}
              </span>

              {quiz.resultsShared && (
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  Results Shared
                </span>
              )}
            </div>
          </div>

          {/* Share Results */}
          {isTest && (
            <div className="shrink-0">
              {quiz.resultsShared ? (
                <div className="rounded-xl border border-success/20 bg-success/5 px-5 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 size={16} />
                    Results already shared
                  </p>
                </div>
              ) : quiz.status !== "completed" ? (
                <div className="rounded-xl border border-border bg-background-elevated px-5 py-3">
                  <p className="text-sm text-text-secondary">
                    Complete the test before sharing
                    results.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border border-border bg-background-elevated px-5 py-3">
                  <p className="text-sm text-text-secondary">
                    No student results available.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!canShareResults}
                  onClick={() =>
                    setShowShareConfirm(true)
                  }
                  className="rounded-button bg-brand-violet px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sharing
                    ? "Sharing Results..."
                    : "Share Results"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Message */}
      {shareMessage && (
        <div className="rounded-card border border-success/20 bg-success/5 p-4">
          <p className="text-sm font-medium text-success">
            {shareMessage}
          </p>
        </div>
      )}

      {shareError && (
        <div className="rounded-card border border-error/20 bg-error/5 p-4">
          <p className="text-sm text-error">
            {shareError}
          </p>
        </div>
      )}

      {/* Analytics */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Performance Overview
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Attempts"
            value={totalAttempts}
          />

          <StatCard
            label="Average"
            value={`${averagePercentage}%`}
          />

          <StatCard
            label="Highest"
            value={`${highestPercentage}%`}
          />

          <StatCard
            label="Lowest"
            value={`${lowestPercentage}%`}
          />
        </div>
      </div>

      {/* Quiz Information */}
      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Quiz Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Questions"
            value={quiz.totalQuestions ?? 0}
          />

          <InfoItem
            label="Quiz Mode"
            value={quiz.quizMode || "practice"}
          />

          <InfoItem
            label="Status"
            value={quiz.status || "unknown"}
          />

          <InfoItem
            label="Results"
            value={
              quiz.resultsShared
                ? "Shared"
                : "Not shared"
            }
          />
        </div>
      </div>

      {/* Student Results */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-text-primary">
            Student Results
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Select a student to view their complete
            attempt.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-violet/10">
              <BarChart3
                size={20}
                className="text-brand-violet"
              />
            </div>

            <p className="mt-4 text-sm text-text-secondary">
              No submitted attempts yet.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-card border border-border bg-surface md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border bg-background-elevated">
                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                        Student
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                        Score
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                        Percentage
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                        Time
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                        Submitted
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((result) => (
                      <tr
                        key={result.attemptId}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-text-primary">
                            {result.student?.name ||
                              "Unknown Student"}
                          </p>

                          <p className="mt-1 text-xs text-text-muted">
                            {result.student?.email ||
                              "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-text-primary">
                          {result.score ?? 0}/
                          {result.totalPoints ?? 0}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-text-primary">
                          {Number(
                            result.percentage
                          ) || 0}
                          %
                        </td>

                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {formatTime(
                            result.timeTaken
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {formatDate(
                            result.submittedAt
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/instructor/results/${quizId}/attempt/${result.attemptId}`}
                            className="text-sm font-medium text-brand-violet hover:underline"
                          >
                            View Attempt
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {results.map((result) => (
                <div
                  key={result.attemptId}
                  className="rounded-card border border-border bg-surface p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-text-primary">
                        {result.student?.name ||
                          "Unknown Student"}
                      </h3>

                      <p className="mt-1 break-all text-xs text-text-muted">
                        {result.student?.email ||
                          "No email"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-brand-violet/10 px-2.5 py-1 text-xs font-medium text-brand-violet">
                      {Number(
                        result.percentage
                      ) || 0}
                      %
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Score"
                      value={`${result.score ?? 0}/${
                        result.totalPoints ?? 0
                      }`}
                    />

                    <InfoItem
                      label="Time"
                      value={formatTime(
                        result.timeTaken
                      )}
                    />

                    <InfoItem
                      label="Submitted"
                      value={formatDate(
                        result.submittedAt
                      )}
                    />

                    <InfoItem
                      label="Type"
                      value={
                        result.submissionType ||
                        "manual"
                      }
                    />
                  </div>

                  <Link
                    to={`/instructor/results/${quizId}/attempt/${result.attemptId}`}
                    className="mt-5 block rounded-button border border-border px-4 py-2.5 text-center text-sm font-medium text-text-primary transition hover:bg-background-elevated"
                  >
                    View Attempt
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Share Confirmation Modal */}
      {showShareConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-violet/10">
              <Mail
                size={20}
                className="text-brand-violet"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-text-primary">
              Share quiz results?
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This will send the results of all
              submitted students to their
              registered email addresses.
            </p>

            <div className="mt-4 rounded-xl bg-background-elevated p-4">
              <p className="text-sm text-text-secondary">
                Students with submitted attempts:
              </p>

              <p className="mt-1 text-lg font-semibold text-text-primary">
                {results.length}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowShareConfirm(false)
                }
                disabled={sharing}
                className="rounded-button border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-background-elevated disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={shareResults}
                disabled={sharing}
                className="rounded-button bg-brand-violet px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sharing
                  ? "Sharing..."
                  : "Share Results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-sm text-text-secondary">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium capitalize text-text-primary">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default InstructorQuizResults;