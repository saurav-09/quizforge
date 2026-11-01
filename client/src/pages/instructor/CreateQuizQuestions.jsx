import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

const createQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  topic: "General",
  subtopic: "",
  difficulty: "medium",
  points: 1,
});

function CreateQuizQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const quizData = location.state || {};

const searchParams = new URLSearchParams(
  location.search
);

const quizId =
  searchParams.get("quizId") ||
  quizData.quizId;

const isEditMode = Boolean(quizId);

  const [questions, setQuestions] = useState(() =>
    Array.isArray(quizData.questions) && quizData.questions.length > 0
      ? quizData.questions
      : [createQuestion()]
  );
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [savedQuestionIds, setSavedQuestionIds] = useState([]);
  const [savingQuestionIndex, setSavingQuestionIndex] = useState(null);

  useEffect(() => {
    if (!quizId) {
      return;
    }

    const fetchQuizQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const response = await fetch(`/api/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load quiz questions"
          );
        }

        const existingQuestions = data.quiz?.questions || [];

        if (existingQuestions.length > 0) {
          setQuestions(
            existingQuestions.map((question) => ({
              _id: question._id,
              question: question.question || "",
              options:
                question.options?.length === 4
                  ? question.options
                  : [
                      ...(question.options || []),
                      ...Array(
                        Math.max(
                          0,
                          4 - (question.options?.length || 0)
                        )
                      ).fill(""),
                    ].slice(0, 4),
              correctAnswer: question.correctAnswer || "",
              explanation: question.explanation || "",
              topic: question.topic || "General",
              subtopic: question.subtopic || "",
              difficulty: question.difficulty || "medium",
              points: question.points || 1,
            }))
          );
        } else {
          setQuestions([createQuestion()]);
        }
      } catch (error) {
        console.error(
          "Fetch quiz questions error:",
          error
        );

        setError(
          error.message || "Failed to load quiz questions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizQuestions();
  }, [quizId]);

  const saveToQuestionBank = async (question, index) => {
    try {
      setSavingQuestionIndex(index);
      const token = await getToken();
      const response = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(question),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save question");
      setSavedQuestionIds((current) => [...current, index]);
      setError("");
    } catch (saveError) {
      setError(saveError.message || "Unable to save question to bank");
    } finally {
      setSavingQuestionIndex(null);
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index
          ? { ...question, [field]: value }
          : question
      )
    );
  };

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const options = [...question.options];
        options[optionIndex] = value;

        return {
          ...question,
          options,
        };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      createQuestion(),
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      return;
    }

    setQuestions((prev) =>
      prev.filter(
        (_, questionIndex) => questionIndex !== index
      )
    );
  };

 const handleContinue = () => {
  const validQuestions = questions.every(
    (question) =>
      question.question.trim() &&
      question.options.every((option) =>
        option.trim()
      ) &&
      question.correctAnswer
  );

  if (!validQuestions) {
    setError(
      "Please complete every question, option, and correct answer."
    );
    return;
  }

  setError("");

  const params = new URLSearchParams();

  if (quizId) {
    params.set("quizId", quizId);
  }

  navigate(
    `/instructor/quizzes/create/settings${
      params.toString()
        ? `?${params.toString()}`
        : ""
    }`,
    {
      state: {
        ...quizData,
        questions,
        quizId,
        isEditMode,
      },
    }
  );
};

  if (!quizData) {
    return (
      <div className="text-sm text-text-secondary">
        Quiz information not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading questions...
        </p>
      </div>
    );
  }

  if (error && isEditMode && questions.length === 1 && !questions[0].question) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-card border border-error/20 bg-error/5 p-6">
          <p className="text-sm text-error">
            {error}
          </p>

          <Link
            to="/instructor/quizzes"
            className="mt-4 inline-flex rounded-button bg-brand-violet px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
         to={`/instructor/quizzes/create${
  quizId ? `?quizId=${quizId}` : ""
}`}
state={quizData}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            {isEditMode
              ? "Edit Questions"
              : "Add Questions"}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            {isEditMode
              ? "Update your quiz questions and answers."
              : "Add questions and choose the correct answers."}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">
            {error}
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <div
            key={question._id || questionIndex}
            className="rounded-xl border border-border bg-white p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Question {questionIndex + 1}
              </h3>

              <div className="flex items-center gap-2">
                <button type="button" disabled={savingQuestionIndex === questionIndex || savedQuestionIds.includes(questionIndex)} onClick={() => saveToQuestionBank(question, questionIndex)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-brand-violet disabled:opacity-50">{savedQuestionIds.includes(questionIndex) ? "Saved to bank" : savingQuestionIndex === questionIndex ? "Saving..." : "Save to bank"}</button>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeQuestion(questionIndex)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove question"
                >
                  <Trash2 size={16} />
                </button>
              )}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Question */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-primary">
                  Question
                </label>

                <textarea
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(
                      questionIndex,
                      "question",
                      e.target.value
                    )
                  }
                  rows={2}
                  placeholder="Enter your question..."
                  className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm outline-none placeholder:text-text-secondary focus:border-[#8B5CF6]"
                />
              </div>

              {/* Options */}
              <div>
                <label className="mb-2 block text-xs font-medium text-text-primary">
                  Options
                </label>

                <div className="space-y-2">
                  {question.options.map(
                    (option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(
                              questionIndex,
                              "correctAnswer",
                              option
                            )
                          }
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            question.correctAnswer ===
                              option &&
                            option.trim()
                              ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                              : "border-border text-text-secondary"
                          }`}
                          aria-label={`Mark option ${
                            optionIndex + 1
                          } as correct`}
                        >
                          <Check size={15} />
                        </button>

                        <input
                          value={option}
                          onChange={(e) =>
                            updateOption(
                              questionIndex,
                              optionIndex,
                              e.target.value
                            )
                          }
                          placeholder={`Option ${
                            optionIndex + 1
                          }`}
                          className="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-text-secondary focus:border-[#8B5CF6]"
                        />
                      </div>
                    )
                  )}
                </div>

                <p className="mt-2 text-xs text-text-secondary">
                  Click the check button to mark the correct answer.
                </p>
              </div>

              {/* Explanation */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-primary">
                  Explanation
                  <span className="ml-1 font-normal text-text-secondary">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={question.explanation}
                  onChange={(e) =>
                    updateQuestion(
                      questionIndex,
                      "explanation",
                      e.target.value
                    )
                  }
                  rows={2}
                  placeholder="Explain the correct answer..."
                  className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm outline-none placeholder:text-text-secondary focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div><label className="mb-1.5 block text-xs font-medium text-text-primary">Topic</label><input value={question.topic || "General"} onChange={(e) => updateQuestion(questionIndex, "topic", e.target.value)} maxLength={100} className="h-9 w-full rounded-lg border border-border px-3 text-sm" /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-text-primary">Subtopic</label><input value={question.subtopic || ""} onChange={(e) => updateQuestion(questionIndex, "subtopic", e.target.value)} maxLength={100} placeholder="Optional" className="h-9 w-full rounded-lg border border-border px-3 text-sm" /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-text-primary">Difficulty</label><select value={question.difficulty || "medium"} onChange={(e) => updateQuestion(questionIndex, "difficulty", e.target.value)} className="h-9 w-full rounded-lg border border-border px-3 text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
              </div>

              {/* Points */}
              <div className="w-full sm:w-32">
                <label className="mb-1.5 block text-xs font-medium text-text-primary">
                  Points
                </label>

                <input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) =>
                    updateQuestion(
                      questionIndex,
                      "points",
                      Number(e.target.value)
                    )
                  }
                  className="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question */}
      <button
        type="button"
        onClick={addQuestion}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
      >
        <Plus size={16} />
        Add Question
      </button>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
       <Link
  to={`/instructor/quizzes/create/questions${
    quizId ? `?quizId=${quizId}` : ""
  }`}
  state={quizData}
  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
>
  <ArrowLeft size={15} />
  Back
</Link>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white hover:bg-[#7C3AED]"
        >
          Continue
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default CreateQuizQuestions;