import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

function InstructorAttemptResult() {
  const { quizId, attemptId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        `/api/quizzes/${quizId}/attempt/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch attempt result"
        );
      }

      setResult(data.result);
    } catch (error) {
      console.error(
        "Fetch instructor attempt result error:",
        error
      );

      setError(
        error.message || "Failed to load attempt result"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [quizId, attemptId]);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) {
      return "0 min";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading attempt result...
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
          onClick={fetchResult}
          className="mt-4 rounded-button bg-brand-violet px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const correctAnswers = result.questions.filter(
    (question) => question.isCorrect
  ).length;

  const incorrectAnswers = result.questions.filter(
    (question) =>
      question.selectedAnswer !== null &&
      !question.isCorrect
  ).length;

  const unanswered = result.questions.filter(
    (question) => question.selectedAnswer === null
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(`/instructor/results/${quizId}`)
          }
          className="mb-4 text-sm font-medium text-brand-violet hover:underline"
        >
          ← Back to Quiz Results
        </button>

        <p className="text-sm font-medium text-brand-violet">
          Student Attempt
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
          {result.student.name}
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {result.student.email}
        </p>

        <p className="mt-1 text-sm text-text-muted">
          {result.quiz.title}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Score"
          value={`${result.score}/${result.totalPoints}`}
        />

        <StatCard
          label="Percentage"
          value={`${result.percentage}%`}
        />

        <StatCard
          label="Correct"
          value={correctAnswers}
        />

        <StatCard
          label="Time Taken"
          value={formatTime(result.timeTaken)}
        />
      </div>

      {/* Attempt Information */}
      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Attempt Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Quiz Mode"
            value={result.quiz.quizMode}
          />

          <InfoItem
            label="Submission"
            value={result.submissionType}
          />

          <InfoItem
            label="Started"
            value={formatDate(result.startedAt)}
          />

          <InfoItem
            label="Submitted"
            value={formatDate(result.submittedAt)}
          />
        </div>
      </div>

      {/* Answer Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Correct Answers"
          value={correctAnswers}
          className="text-success"
        />

        <SummaryCard
          label="Incorrect Answers"
          value={incorrectAnswers}
          className="text-error"
        />

        <SummaryCard
          label="Unanswered"
          value={unanswered}
          className="text-text-secondary"
        />
      </div>

      {/* Questions */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-text-primary">
            Question Review
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Review every question and the student's answers.
          </p>
        </div>

        <div className="space-y-5">
          {result.questions.map((question, index) => (
            <QuestionCard
              key={question.questionId}
              question={question}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
        <Link
          to={`/instructor/results/${quizId}`}
          className="rounded-button border border-border px-5 py-2.5 text-center text-sm font-medium text-text-primary transition hover:bg-background-elevated"
        >
          Back to Quiz Results
        </Link>

        <Link
          to="/instructor/results"
          className="rounded-button bg-brand-violet px-5 py-2.5 text-center text-sm font-medium text-white transition hover:opacity-90"
        >
          All Results
        </Link>
      </div>
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
        {value}
      </p>
    </div>
  );
}

function SummaryCard({ label, value, className }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-sm text-text-secondary">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-semibold ${className}`}>
        {value}
      </p>
    </div>
  );
}

function QuestionCard({ question, index }) {
  const isUnanswered = question.selectedAnswer === null;

  return (
    <div className="rounded-card border border-border bg-surface p-6">
      {/* Question Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted">
            Question {index + 1}
          </p>

          <h3 className="mt-1 text-base font-medium leading-7 text-text-primary">
            {question.question}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isUnanswered
              ? "bg-background-elevated text-text-secondary"
              : question.isCorrect
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {isUnanswered
            ? "Unanswered"
            : question.isCorrect
            ? "Correct"
            : "Incorrect"}
        </span>
      </div>

      {/* Options */}
      <div className="mt-5 space-y-2">
        {question.options?.map((option, optionIndex) => {
          const isSelected =
            question.selectedAnswer === option;

          const isCorrect =
            question.correctAnswer === option;

          let optionClass =
            "border-border bg-background";

          if (isCorrect) {
            optionClass =
              "border-success/30 bg-success/5";
          } else if (isSelected) {
            optionClass =
              "border-error/30 bg-error/5";
          }

          return (
            <div
              key={optionIndex}
              className={`rounded-xl border p-3 ${optionClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background-elevated text-xs font-medium text-text-secondary">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>

                  <span className="text-sm text-text-primary">
                    {option}
                  </span>
                </div>

                <div className="shrink-0 text-xs font-medium">
                  {isCorrect && (
                    <span className="text-success">
                      Correct Answer
                    </span>
                  )}

                  {!isCorrect && isSelected && (
                    <span className="text-error">
                      Student Answer
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer Details */}
      <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-text-muted">
            Student Answer
          </p>

          <p
            className={`mt-1 text-sm font-medium ${
              isUnanswered
                ? "text-text-muted"
                : question.isCorrect
                ? "text-success"
                : "text-error"
            }`}
          >
            {question.selectedAnswer || "Not answered"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-text-muted">
            Correct Answer
          </p>

          <p className="mt-1 text-sm font-medium text-success">
            {question.correctAnswer}
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-text-secondary">
          Points
        </span>

        <span className="text-sm font-semibold text-text-primary">
          {question.pointsEarned}/{question.points}
        </span>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="mt-4 rounded-xl bg-background-elevated p-4">
          <p className="text-xs font-medium text-text-muted">
            Explanation
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export default InstructorAttemptResult;