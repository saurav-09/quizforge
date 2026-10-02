import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

function InstructorQuizResults() {
  const { quizId } = useParams();
  const { getToken } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to fetch quiz results"
        );
      }

      setData(responseData);
    } catch (error) {
      console.error("Fetch quiz results error:", error);
      setError(
        error.message || "Failed to load quiz results"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchResults();
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading quiz results...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/instructor/results"
          className="text-sm text-brand-violet hover:underline"
        >
          ← Back to Results
        </Link>

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
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { quiz, analytics, results } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/instructor/results"
          className="text-sm text-brand-violet hover:underline"
        >
          ← Back to Results
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
                {quiz.title}
              </h1>

              <span className="rounded-full bg-brand-violet/10 px-2.5 py-1 text-xs font-medium capitalize text-brand-violet">
                {quiz.quizMode}
              </span>
            </div>

            <p className="mt-2 text-sm text-text-secondary">
              {quiz.description || "No description available."}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
              quiz.status === "completed"
                ? "bg-success/10 text-success"
                : quiz.status === "published"
                ? "bg-brand-indigo/10 text-brand-indigo"
                : "bg-background-elevated text-text-secondary"
            }`}
          >
            {quiz.status}
          </span>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Attempts"
          value={analytics.totalAttempts}
        />

        <StatCard
          label="Average Score"
          value={`${analytics.averagePercentage}%`}
        />

        <StatCard
          label="Highest Score"
          value={`${analytics.highestPercentage}%`}
        />

        <StatCard
          label="Lowest Score"
          value={`${analytics.lowestPercentage}%`}
        />
      </div>

      {/* Quiz information */}
      <div className="rounded-card border border-border bg-surface p-5">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-text-muted">Questions</p>
            <p className="mt-1 font-medium text-text-primary">
              {quiz.totalQuestions}
            </p>
          </div>

          <div>
            <p className="text-text-muted">Quiz Mode</p>
            <p className="mt-1 font-medium capitalize text-text-primary">
              {quiz.quizMode}
            </p>
          </div>

          {quiz.quizMode === "test" && (
            <div>
              <p className="text-text-muted">Results</p>
              <p className="mt-1 font-medium text-text-primary">
                {quiz.resultsShared
                  ? "Shared"
                  : "Not shared"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Student Results
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            View submitted attempts for this quiz.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-violet/10 text-xl">
              📊
            </div>

            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              No submitted attempts
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
              Student results will appear here after they submit the quiz.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-background-elevated">
                  <tr>
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                      Score
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                      Percentage
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                      Time
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {results.map((result) => (
                    <tr
                      key={result.attemptId}
                      className="transition hover:bg-background-elevated/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-text-primary">
                          {result.student.name}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {result.student.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-text-primary">
                        {result.score} / {result.totalPoints}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-text-primary">
                          {result.percentage}%
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {formatTime(result.timeTaken)}
                      </td>

                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {formatDate(result.submittedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          to={`/instructor/results/${quizId}/attempt/${result.attemptId}`}
                          className="text-sm font-medium text-brand-violet hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {results.map((result) => (
                <div
                  key={result.attemptId}
                  className="space-y-4 p-5"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {result.student.name}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {result.student.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Score"
                      value={`${result.score} / ${result.totalPoints}`}
                    />

                    <InfoItem
                      label="Percentage"
                      value={`${result.percentage}%`}
                    />

                    <InfoItem
                      label="Time"
                      value={formatTime(result.timeTaken)}
                    />

                    <InfoItem
                      label="Submitted"
                      value={formatDate(result.submittedAt)}
                    />
                  </div>

                  <Link
                    to={`/instructor/results/${quizId}/attempt/${result.attemptId}`}
                    className="inline-flex w-full items-center justify-center rounded-button bg-brand-violet px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    View Attempt
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-sm text-text-secondary">{label}</p>

      <p className="mt-2 text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">
        {value}
      </p>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) {
    return "0 min";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString();
}

export default InstructorQuizResults;