import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

function CreateQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const quizId = searchParams.get("quizId");

  const isEditMode = Boolean(quizId);

  const [quizMode, setQuizMode] = useState(location.state?.quizMode || "practice");

  const [formData, setFormData] = useState({
    title: location.state?.title || "",
    description: location.state?.description || "",
  });

  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [generating, setGenerating] = useState(false);

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) {
      return;
    }

    const fetchQuiz = async () => {
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
            data.message || "Failed to load quiz"
          );
        }

        const quiz = data.quiz;

        setFormData({
          title: quiz.title || "",
          description: quiz.description || "",
        });

        setQuizMode(
          quiz.settings?.quizMode || "practice"
        );
      } catch (error) {
        console.error("Fetch quiz for editing error:", error);

        setError(
          error.message || "Failed to load quiz"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateQuestions = async () => {
    if (isEditMode) return;

    if (aiTopic.trim().length < 3) {
      setError("Enter a topic with at least 3 characters to generate questions.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const token = await getToken();
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          questionCount: Number(aiCount),
          difficulty: aiDifficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate questions");
      }

      const title = formData.title.trim() || `${aiTopic.trim()} Quiz`;
      const description =
        formData.description.trim() ||
        `A ${aiDifficulty}-difficulty quiz about ${aiTopic.trim()}.`;

      setFormData({ title, description });

      navigate("/instructor/quizzes/create/questions", {
        state: {
          title,
          description,
          quizMode,
          questions: data.questions.map((question) => ({ ...question, topic: question.topic || aiTopic.trim(), difficulty: question.difficulty || aiDifficulty })),
          isEditMode: false,
        },
      });
    } catch (requestError) {
      console.error("AI question generation error:", requestError);
      setError(requestError.message || "Unable to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = () => {
  if (!formData.title.trim()) {
    return;
  }

  const params = new URLSearchParams();

  if (quizId) {
    params.set("quizId", quizId);
  }

  navigate(
    `/instructor/quizzes/create/questions${
      params.toString()
        ? `?${params.toString()}`
        : ""
    }`,
    {
      state: {
        ...formData,
        quizMode,
        quizId,
        isEditMode,
        questions: location.state?.questions || [],
      },
    }
  );
};

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-secondary">
          Loading quiz...
        </p>
      </div>
    );
  }

  if (error) {
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
          to="/instructor/quizzes"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={17} />
        </Link>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            {isEditMode ? "Edit Quiz" : "Create Quiz"}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            {isEditMode
              ? "Update your quiz information."
              : "Create a new quiz for your students."}
          </p>
        </div>
      </div>

      {/* Quiz Type */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Quiz type
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Choose how students will experience this quiz.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setQuizMode("practice")}
            className={`rounded-xl border p-4 text-left transition-colors ${
              quizMode === "practice"
                ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                : "border-border hover:bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Practice
                </h4>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Students can see their score, correct answers,
                  and explanations after submission.
                </p>
              </div>

              {quizMode === "practice" && (
                <Check
                  size={17}
                  className="shrink-0 text-[#8B5CF6]"
                />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setQuizMode("test")}
            className={`rounded-xl border p-4 text-left transition-colors ${
              quizMode === "test"
                ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                : "border-border hover:bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Test
                </h4>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Students only see a submission confirmation.
                  Results are shared by the instructor later.
                </p>
              </div>

              {quizMode === "test" && (
                <Check
                  size={17}
                  className="shrink-0 text-[#8B5CF6]"
                />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Basic information
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Quiz title
            </label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Java OOP Basics"
              className="h-10 w-full rounded-lg border border-border px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-primary">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe this quiz..."
              className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-[#8B5CF6]"
            />
          </div>
        </div>
      </div>

      {/* AI question generation */}
      {!isEditMode && (
        <div className="rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/[0.04] p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
              <Sparkles size={19} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Generate questions with AI
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Create a question set from a topic, then review and edit every question before publishing.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-text-primary">
                Topic
              </label>
              <input
                value={aiTopic}
                onChange={(event) => setAiTopic(event.target.value)}
                maxLength={300}
                placeholder="e.g. JavaScript closures and promises"
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-primary">
                Number of questions
              </label>
              <select
                value={aiCount}
                onChange={(event) => setAiCount(Number(event.target.value))}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-[#8B5CF6]"
              >
                {[5, 10, 15, 20].map((count) => (
                  <option key={count} value={count}>{count} questions</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-primary">
                Difficulty
              </label>
              <select
                value={aiDifficulty}
                onChange={(event) => setAiDifficulty(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-[#8B5CF6]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={generating || aiTopic.trim().length < 3}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white transition hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generating ? "Generating..." : "Generate questions"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            AI-generated content can contain mistakes. Review answers before publishing.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          to="/instructor/quizzes"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={15} />
          Cancel
        </Link>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!formData.title.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEditMode ? "Continue Editing" : "Continue"}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default CreateQuiz;