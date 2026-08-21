import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

function Onboarding() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectRole = async (role) => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch("/api/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      if (role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/student");
      }
    } catch (error) {
      console.error("Role selection failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            How will you use QuizForge?
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Choose the option that best describes you.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => selectRole("student")}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 text-left transition hover:-translate-y-1 hover:border-[#8B5CF6]/40 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-xl">
              🎓
            </div>

            <h2 className="text-lg font-semibold text-text-primary">
              I'm a Student
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Join quizzes, test your knowledge, and track your performance.
            </p>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => selectRole("instructor")}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 text-left transition hover:-translate-y-1 hover:border-[#8B5CF6]/40 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#6366F1]/10 text-xl">
              ✨
            </div>

            <h2 className="text-lg font-semibold text-text-primary">
              I'm an Instructor
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Create assessments, run live sessions, and analyze results.
            </p>
          </button>
        </div>

        {error && (
          <p className="mt-5 text-center text-sm text-[#F87171]">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default Onboarding;