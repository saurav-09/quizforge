import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  Loader2,
  Shuffle,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

function CreateQuizPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const quizData = location.state;

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  if (!quizData) {
    return (
      <div className="text-sm text-text-secondary">
        Quiz information not found.
      </div>
    );
  }

  const totalPoints = quizData.questions.reduce(
    (total, question) => total + Number(question.points || 0),
    0
  );

  const publishQuiz = async () => {
    try {
      setPublishing(true);
      setError("");

      const token = await getToken();

      const payload = {
        title: quizData.title.trim(),
        description: quizData.description?.trim() || "",
        questions: quizData.questions.map((question) => ({
          question: question.question.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: question.correctAnswer,
          explanation: question.explanation?.trim() || "",
          points: Number(question.points) || 1,
        })),
        settings: {
          timeLimit: Number(quizData.settings.timeLimit),
          attemptsAllowed: Number(
            quizData.settings.attemptsAllowed
          ),
          shuffleQuestions: quizData.settings.shuffleQuestions,
          showResults:
            quizData.quizMode === "practice"
              ? quizData.settings.showResults
              : false,
          quizMode: quizData.quizMode,
        },
        startTime:
          quizData.quizMode === "test"
            ? quizData.startTime
            : null,
      };

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create quiz");
      }

      navigate("/instructor/quizzes");
    } catch (error) {
      console.error("Create quiz error:", error);
      setError(error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/instructor/quizzes/create/settings"
          state={quizData}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            Preview Quiz
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Review everything before publishing.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-text-primary">
                {quizData.title}
              </h3>

              <span className="rounded-full bg-[#8B5CF6]/10 px-2.5 py-1 text-xs font-medium capitalize text-[#7C3AED]">
                {quizData.quizMode}
              </span>
            </div>

            {quizData.description && (
              <p className="mt-2 text-sm text-text-secondary">
                {quizData.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-surface p-3">
            <FileText
              size={17}
              className="text-text-secondary"
            />

            <p className="mt-2 text-xs text-text-secondary">
              Questions
            </p>

            <p className="text-sm font-semibold text-text-primary">
              {quizData.questions.length}
            </p>
          </div>

          <div className="rounded-lg bg-surface p-3">
            <Clock3
              size={17}
              className="text-text-secondary"
            />

            <p className="mt-2 text-xs text-text-secondary">
              Time limit
            </p>

            <p className="text-sm font-semibold text-text-primary">
              {quizData.settings.timeLimit} minutes
            </p>
          </div>

          <div className="rounded-lg bg-surface p-3">
            <Users
              size={17}
              className="text-text-secondary"
            />

            <p className="mt-2 text-xs text-text-secondary">
              Attempts
            </p>

            <p className="text-sm font-semibold text-text-primary">
              {quizData.settings.attemptsAllowed}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quizData.settings.shuffleQuestions && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary">
              <Shuffle size={13} />
              Questions shuffled
            </span>
          )}

          {quizData.quizMode === "practice" &&
            quizData.settings.showResults && (
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary">
                Results shown after submission
              </span>
            )}
        </div>

        {quizData.quizMode === "test" && (
          <div className="mt-4 rounded-lg border border-border p-3">
            <p className="text-xs text-text-secondary">
              Test starts
            </p>

            <p className="mt-1 text-sm font-medium text-text-primary">
              {new Date(quizData.startTime).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Questions
          </h3>

          <span className="text-xs text-text-secondary">
            {totalPoints} total points
          </span>
        </div>

        {quizData.questions.map((question, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-white p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium text-text-secondary">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {question.question}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        option === question.correctAnswer
                          ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-text-primary"
                          : "border-border text-text-secondary"
                      }`}
                    >
                      {option === question.correctAnswer ? (
                        <Check
                          size={14}
                          className="shrink-0 text-[#8B5CF6]"
                        />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}

                      <span>{option}</span>
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <p className="mt-3 text-xs leading-5 text-text-secondary">
                    <span className="font-medium text-text-primary">
                      Explanation:
                    </span>{" "}
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/instructor/quizzes/create/settings"
          state={quizData}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={15} />
          Back
        </Link>

        <button
          type="button"
          onClick={publishQuiz}
          disabled={publishing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Check size={16} />
              Publish Quiz
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CreateQuizPreview;