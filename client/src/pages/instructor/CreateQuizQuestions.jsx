import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const createQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  points: 1,
});

function CreateQuizQuestions() {
  const location = useLocation();
  const navigate = useNavigate();

  const quizData = location.state;

  const [questions, setQuestions] = useState([createQuestion()]);

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index
          ? { ...question, [field]: value }
          : question
      )
    );
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) return question;

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
    setQuestions((prev) => [...prev, createQuestion()]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;

    setQuestions((prev) =>
      prev.filter((_, questionIndex) => questionIndex !== index)
    );
  };

  const handleContinue = () => {
    const validQuestions = questions.every(
      (question) =>
        question.question.trim() &&
        question.options.every((option) => option.trim()) &&
        question.correctAnswer
    );

    if (!validQuestions) return;

    navigate("/instructor/quizzes/create/settings", {
      state: {
        ...quizData,
        questions,
      },
    });
  };

  if (!quizData) {
    return (
      <div className="text-sm text-text-secondary">
        Quiz information not found.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/instructor/quizzes/create"
          state={quizData}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            Add Questions
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Add questions and choose the correct answers.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="rounded-xl border border-border bg-white p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Question {questionIndex + 1}
              </h3>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove question"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
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

              <div>
                <label className="mb-2 block text-xs font-medium text-text-primary">
                  Options
                </label>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
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
                          question.correctAnswer === option &&
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
                        placeholder={`Option ${optionIndex + 1}`}
                        className="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-text-secondary focus:border-[#8B5CF6]"
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-text-secondary">
                  Click the check button to mark the correct answer.
                </p>
              </div>

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

      <button
        type="button"
        onClick={addQuestion}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
      >
        <Plus size={16} />
        Add Question
      </button>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/instructor/quizzes/create"
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