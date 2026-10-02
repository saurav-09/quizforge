import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

function StudentQuizAttempt() {
  const { quizId, attemptId } = useParams();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /*
   * -------------------------------------------------------
   * State
   * -------------------------------------------------------
   */

  const [quiz, setQuiz] = useState(
    location.state?.quiz || null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState(
    location.state?.answers || {}
  );

  const [deadline, setDeadline] = useState(
    location.state?.deadline
      ? new Date(location.state.deadline).getTime()
      : null
  );

  const [remainingSeconds, setRemainingSeconds] =
    useState(null);

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [submissionResult, setSubmissionResult] =
    useState(null);

  const [submissionType, setSubmissionType] =
    useState("manual");

  const [showSubmitConfirm, setShowSubmitConfirm] =
    useState(false);

  /*
   * Keep latest answers available inside async functions.
   */
  const answersRef = useRef(answers);

  /*
   * Prevent duplicate submissions.
   */
  const submittedRef = useRef(false);

  /*
   * Autosave debounce timer.
   */
  const saveTimeoutRef = useRef(null);

  /*
   * -------------------------------------------------------
   * Keep answersRef synchronized
   * -------------------------------------------------------
   */

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /*
   * -------------------------------------------------------
   * Load attempt
   *
   * If quiz data exists in router state, use it.
   *
   * If the page was refreshed, router state disappears.
   * In that case, fetch the attempt from backend.
   * -------------------------------------------------------
   */

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        /*
         * If we already have quiz + deadline from the
         * Start Quiz response, no need to fetch again.
         */
        if (
          location.state?.quiz &&
          location.state?.deadline
        ) {
          setLoading(false);
          return;
        }

        /*
         * Refresh / direct page load.
         */
        const response = await fetch(
          `/api/quiz-attempts/${attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load quiz attempt"
          );
        }

        setQuiz(data.quiz);

        /*
         * Restore previously saved answers.
         */
        const restoredAnswers = {};

        for (const answer of data.answers || []) {
          if (
            answer.questionId &&
            answer.selectedAnswer
          ) {
            restoredAnswers[
              answer.questionId
            ] = answer.selectedAnswer;
          }
        }

        setAnswers(restoredAnswers);
        answersRef.current = restoredAnswers;

        /*
         * Restore deadline.
         */
        if (data.deadline) {
          setDeadline(
            new Date(data.deadline).getTime()
          );
        }

        /*
         * If backend says attempt is already submitted,
         * show submission state instead of quiz.
         */
        if (data.status === "submitted") {
          setSubmitted(true);

          setSubmissionResult(
            data.result || null
          );

          setSubmissionType(
            data.submissionType || "manual"
          );
        }
      } catch (error) {
        console.error(
          "Load quiz attempt error:",
          error
        );

        setError(
          error.message ||
            "Failed to load quiz attempt"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [attemptId, getToken, location.state]);

  /*
   * -------------------------------------------------------
   * Format timer
   * -------------------------------------------------------
   */

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const safeSeconds = Math.max(
      0,
      seconds
    );

    const minutes = Math.floor(
      safeSeconds / 60
    );

    const remaining = safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(2, "0")}`;
  };

  /*
   * -------------------------------------------------------
   * Timer
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!deadline || submitted) {
      return;
    }

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil(
          (deadline - Date.now()) / 1000
        )
      );

      setRemainingSeconds(seconds);
    };

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [deadline, submitted]);

  /*
   * -------------------------------------------------------
   * Convert local answer object into API format
   * -------------------------------------------------------
   */

  const getFormattedAnswers = (
    answersObject = answersRef.current
  ) => {
    return Object.entries(
      answersObject
    ).map(
      ([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      })
    );
  };

  /*
   * -------------------------------------------------------
   * Save progress
   * -------------------------------------------------------
   */

  const saveProgress = async (
    answersToSave = answersRef.current
  ) => {
    if (submittedRef.current) {
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      const response = await fetch(
        `/api/quiz-attempts/${attemptId}/answers`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            answers:
              getFormattedAnswers(
                answersToSave
              ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save quiz progress"
        );
      }
    } catch (error) {
      console.error(
        "Save progress error:",
        error
      );

      /*
       * We don't clear local answers when autosave
       * fails. They remain in the browser state and
       * will be included in final submission.
       */
    } finally {
      setSaving(false);
    }
  };

  /*
   * -------------------------------------------------------
   * Schedule autosave
   * -------------------------------------------------------
   */

  const scheduleSave = (nextAnswers) => {
    if (saveTimeoutRef.current) {
      clearTimeout(
        saveTimeoutRef.current
      );
    }

    saveTimeoutRef.current = setTimeout(
      () => {
        saveProgress(nextAnswers);
      },
      500
    );
  };

  /*
   * -------------------------------------------------------
   * Handle answer selection
   * -------------------------------------------------------
   */

  const handleAnswer = (answer) => {
    if (
      submittedRef.current ||
      submitting
    ) {
      return;
    }

    const question =
      quiz?.questions?.[
        currentQuestion
      ];

    if (!question) {
      return;
    }

    const nextAnswers = {
      ...answersRef.current,

      [question._id]: answer,
    };

    setAnswers(nextAnswers);

    answersRef.current =
      nextAnswers;

    scheduleSave(nextAnswers);
  };

  /*
   * -------------------------------------------------------
   * Submit Quiz
   * -------------------------------------------------------
   */

  const submitQuiz = async (automatic = false) => {
  if (
    submittedRef.current ||
    submitting
  ) {
    return;
  }

  try {
    submittedRef.current = true;

    setSubmitting(true);
    setError("");

    /*
     * Stop any pending autosave.
     */
    if (saveTimeoutRef.current) {
      clearTimeout(
        saveTimeoutRef.current
      );
    }

    const token = await getToken();

    /*
     * Convert local answers object into
     * backend submission format.
     */
    const formattedAnswers = Object.entries(
      answersRef.current
    ).map(
      ([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      })
    );

    const response = await fetch(
      `/api/quiz-attempts/${attemptId}/submit`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          answers: formattedAnswers,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      /*
       * Allow another submission attempt if
       * the request itself failed.
       */
      submittedRef.current = false;

      throw new Error(
        data.message ||
          "Failed to submit quiz"
      );
    }

    /*
     * Backend decides the actual submission type.
     *
     * This is important because the backend may
     * determine that the deadline has already passed.
     */
    const finalSubmissionType =
      data.submissionType ||
      (automatic
        ? "automatic"
        : "manual");

    setSubmissionType(
      finalSubmissionType
    );

    setSubmissionResult(
      data.result || null
    );

    setShowSubmitConfirm(false);
    setRemainingSeconds(0);

    /*
     * -------------------------------------------------------
     * PRACTICE MODE
     *
     * Practice result is available immediately.
     * Open the detailed result page.
     * -------------------------------------------------------
     */

    if (
      quiz?.settings?.quizMode !==
        "test" &&
      data.result
    ) {
      navigate(
        `/student/results/${attemptId}`
      );

      return;
    }

    /*
     * -------------------------------------------------------
     * TEST MODE
     *
     * Test result may be hidden until the instructor
     * shares it, so keep the submitted screen here.
     * -------------------------------------------------------
     */

    setSubmitted(true);
  } catch (error) {
    console.error(
      "Submit quiz error:",
      error
    );

    setError(
      error.message ||
        "Failed to submit quiz"
    );

    /*
     * Only reset the submitted lock when
     * the submission request failed.
     *
     * If submission succeeded, execution reaches
     * the navigation / submitted state above.
     */
    submittedRef.current = false;
  } finally {
    setSubmitting(false);
  }
};

  /*
   * -------------------------------------------------------
   * Automatic submission
   *
   * Timer reaches 0 → submit automatically.
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (
      remainingSeconds === null ||
      remainingSeconds > 0 ||
      submitted ||
      submitting
    ) {
      return;
    }

    submitQuiz(true);
  }, [
    remainingSeconds,
    submitted,
    submitting,
  ]);

  /*
   * -------------------------------------------------------
   * Cleanup
   * -------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(
          saveTimeoutRef.current
        );
      }
    };
  }, []);

  /*
   * -------------------------------------------------------
   * Previous Question
   * -------------------------------------------------------
   */

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (current) => current - 1
      );
    }
  };

  /*
   * -------------------------------------------------------
   * Next Question
   * -------------------------------------------------------
   */

  const goToNext = () => {
    if (
      quiz?.questions &&
      currentQuestion <
        quiz.questions.length - 1
    ) {
      setCurrentQuestion(
        (current) => current + 1
      );
    }
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

          Loading quiz...
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Error when quiz cannot be loaded
   * -------------------------------------------------------
   */

  if (error && !quiz) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to open quiz
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Link
            to="/student/quizzes"
            className="mt-6 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Submitted screen
   * -------------------------------------------------------
   */

  if (submitted) {
    const isTest =
      quiz?.settings?.quizMode ===
      "test";

    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              size={28}
              className="text-emerald-600"
            />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary">
            {isTest
              ? "Test submitted successfully"
              : "Quiz completed"}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            {submissionType ===
            "automatic"
              ? "Your quiz was automatically submitted when the time ended."
              : isTest
              ? "Your answers have been recorded successfully."
              : "Your quiz has been submitted and your result is ready."}
          </p>

          {/*
           * Practice result
           */}
          {!isTest &&
            submissionResult && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Score
                  </p>

                  <p className="mt-2 font-display text-3xl font-bold text-text-primary">
                    {submissionResult.score}

                    <span className="text-lg text-text-muted">
                      {" "}
                      /{" "}
                      {
                        submissionResult.totalPoints
                      }
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Percentage
                  </p>

                  <p className="mt-2 font-display text-3xl font-bold text-brand-violet">
                    {Math.round(
                      submissionResult.percentage ||
                        0
                    )}
                    %
                  </p>
                </div>
              </div>
            )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/student/quizzes"
              className="inline-flex items-center justify-center rounded-[10px] border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface"
            >
              Back to Quizzes
            </Link>

            <button
              type="button"
              onClick={() =>
                navigate("/student")
              }
              className="inline-flex items-center justify-center rounded-[10px] bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Questions
   * -------------------------------------------------------
   */

  const questions =
    quiz?.questions || [];

  const question =
    questions[currentQuestion];

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-xl font-semibold text-text-primary">
          No questions available
        </h1>

        <Link
          to="/student/quizzes"
          className="mt-5 inline-flex rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to Quizzes
        </Link>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Derived values
   * -------------------------------------------------------
   */

  const selectedAnswer =
    answers[question._id];

  const answeredCount =
    Object.keys(answers).length;

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) /
          questions.length) *
        100
      : 0;

  const isLastQuestion =
    currentQuestion ===
    questions.length - 1;

  const isTest =
    quiz.settings?.quizMode ===
    "test";

  /*
   * -------------------------------------------------------
   * Main UI
   * -------------------------------------------------------
   */

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={16} />

            Exit Quiz
          </Link>

          <h1 className="mt-3 font-display text-xl font-semibold text-text-primary">
            {quiz.title}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span>
              {isTest
                ? "Test"
                : "Practice"}
            </span>

            <span>•</span>

            <span>
              {answeredCount} /{" "}
              {questions.length} answered
            </span>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${
            remainingSeconds !==
              null &&
            remainingSeconds <= 60
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-border bg-surface text-text-primary"
          }`}
        >
          <Clock3 size={17} />

          <span className="font-mono text-sm font-semibold">
            {formatTime(
              remainingSeconds
            )}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            Question{" "}
            {currentQuestion + 1} of{" "}
            {questions.length}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-indigo transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
              Question{" "}
              {currentQuestion + 1}
            </p>

            <h2 className="mt-3 text-xl font-semibold leading-8 text-text-primary">
              {question.question}
            </h2>
          </div>

          <span className="shrink-0 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary">
            {question.points}{" "}
            {question.points === 1
              ? "point"
              : "points"}
          </span>
        </div>

        {/* Options */}
        <div className="mt-8 space-y-3">
          {question.options.map(
            (option, index) => {
              const isSelected =
                selectedAnswer ===
                option;

              return (
                <button
                  key={`${question._id}-${index}`}
                  type="button"
                  onClick={() =>
                    handleAnswer(option)
                  }
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-brand-violet bg-brand-violet/5 shadow-sm"
                      : "border-border bg-white hover:border-brand-violet/40 hover:bg-surface"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
                      isSelected
                        ? "border-brand-violet bg-brand-violet text-white"
                        : "border-border bg-surface text-text-secondary"
                    }`}
                  >
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span
                    className={`text-sm leading-6 ${
                      isSelected
                        ? "font-medium text-text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    {option}
                  </span>

                  {isSelected && (
                    <CheckCircle2
                      size={19}
                      className="ml-auto shrink-0 text-brand-violet"
                    />
                  )}
                </button>
              );
            }
          )}
        </div>

        {/* Save status */}
        <div className="mt-5 flex min-h-5 justify-end">
          {saving && (
            <span className="text-xs text-text-muted">
              Saving...
            </span>
          )}

          {!saving &&
            answeredCount > 0 && (
              <span className="text-xs text-emerald-600">
                Progress saved
              </span>
            )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={
            currentQuestion === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={16} />

          Previous
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            onClick={goToNext}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Next

            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setShowSubmitConfirm(true)
            }
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />

            Submit Quiz
          </button>
        )}
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-text-primary">
              Submit quiz?
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              You have answered{" "}
              <strong className="text-text-primary">
                {answeredCount}
              </strong>{" "}
              of{" "}
              <strong className="text-text-primary">
                {questions.length}
              </strong>{" "}
              questions.
            </p>

            {answeredCount <
              questions.length && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Some questions are unanswered.
                They will be submitted without
                an answer.
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowSubmitConfirm(false)
                }
                disabled={submitting}
                className="rounded-[10px] border border-border px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface disabled:opacity-50"
              >
                Continue Quiz
              </button>

              <button
                type="button"
                onClick={() =>
                  submitQuiz(false)
                }
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Submitting..."
                  : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentQuizAttempt;