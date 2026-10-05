import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

function StudentJoinQuiz() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinQuiz = async (event) => {
    event.preventDefault();

    const code = accessCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter the quiz access code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch("/api/quizzes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accessCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to join quiz"
        );
      }

      sessionStorage.setItem(
  `quiz-access-code-${data.quiz._id}`,
  code
);

      navigate(`/student/quizzes/${data.quiz._id}`, {
        state: {
          quiz: data.quiz,
          accessCode: code,
        },
      });
    } catch (error) {
      console.error("Join quiz error:", error);

      setError(
        error.message || "Failed to join quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
          Join Quiz
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Enter the access code shared by your instructor.
        </p>
      </div>

      <form
        onSubmit={handleJoinQuiz}
        className="mt-6 rounded-card border border-border bg-surface p-6"
      >
        <label
          htmlFor="accessCode"
          className="text-sm font-medium text-text-primary"
        >
          Quiz Access Code
        </label>

        <input
          id="accessCode"
          type="text"
          value={accessCode}
          onChange={(event) =>
            setAccessCode(
              event.target.value
                .toUpperCase()
                .replace(/\s/g, "")
            )
          }
          placeholder="Enter code"
          maxLength={6}
          autoComplete="off"
          className="mt-2 w-full rounded-button border border-border bg-white px-4 py-3 text-sm uppercase tracking-widest text-text-primary outline-none focus:border-brand-violet"
        />

        {error && (
          <p className="mt-3 text-sm text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-button bg-brand-violet px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Joining..." : "Join Quiz"}
        </button>
      </form>
    </div>
  );
}

export default StudentJoinQuiz;