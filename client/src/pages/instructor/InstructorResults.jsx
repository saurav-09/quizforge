import { useState } from "react";
import { useAuth } from "@clerk/react";
import { CheckCircle, Mail, Users } from "lucide-react";

function InstructorResults() {
  const { getToken } = useAuth();

  const [quizId, setQuizId] = useState("");
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");

  const loadResults = async () => {
    if (!quizId.trim()) return;

    try {
      setLoading(true);
      setMessage("");

      const token = await getToken();

      const response = await fetch(`/api/quizzes/${quizId}/results`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load results");
      }

      setQuiz(data.quiz);
      setResults(data.results);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const shareResults = async () => {
    try {
      setSharing(true);
      setMessage("");

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to share results");
      }

      setMessage(
        `${data.sent} result email(s) sent successfully.`
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          Test Results
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          View student results and share completed test results.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            placeholder="Enter Quiz ID"
            className="h-10 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-brand"
          />

          <button
            onClick={loadResults}
            disabled={loading}
            className="h-10 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white hover:bg-[#7C3AED] disabled:opacity-50"
          >
            {loading ? "Loading..." : "View Results"}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
          {message}
        </div>
      )}

      {quiz && (
        <>
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">
                  {quiz.title}
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  {results.length} submitted attempt
                  {results.length !== 1 ? "s" : ""}
                </p>
              </div>

              {quiz.status === "completed" && !quiz.resultsShared && (
                <button
                  onClick={shareResults}
                  disabled={sharing || results.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail size={16} />
                  {sharing ? "Sending..." : "Share Results"}
                </button>
              )}

              {quiz.resultsShared && (
                <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle size={16} />
                  Results Shared
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-brand" />

                <div>
                  <p className="text-xs text-text-secondary">
                    Participants
                  </p>

                  <p className="text-xl font-semibold text-text-primary">
                    {results.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-5">
              <div>
                <p className="text-xs text-text-secondary">
                  Status
                </p>

                <p className="mt-1 text-xl font-semibold capitalize text-text-primary">
                  {quiz.status}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="border-b border-border px-4 py-4">
              <h3 className="font-semibold text-text-primary">
                Student Results
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-left text-xs text-text-secondary">
                    <th className="px-4 py-3 font-medium">
                      Student
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Email
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Score
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Percentage
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Submission
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result._id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {result.student?.name || "Student"}
                      </td>

                      <td className="px-4 py-3 text-text-secondary">
                        {result.student?.email || "No email"}
                      </td>

                      <td className="px-4 py-3 text-text-primary">
                        {result.score}/{result.totalPoints}
                      </td>

                      <td className="px-4 py-3 text-text-primary">
                        {result.percentage}%
                      </td>

                      <td className="px-4 py-3 capitalize text-text-secondary">
                        {result.submissionType}
                      </td>
                    </tr>
                  ))}

                  {results.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-sm text-text-secondary"
                      >
                        No submitted results yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InstructorResults;