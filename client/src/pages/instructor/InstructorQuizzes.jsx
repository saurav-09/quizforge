import { useEffect, useState } from "react";
import { BookOpen, Plus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

function InstructorQuizzes() {
  const { getToken } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getToken();

        const response = await fetch("/api/quizzes/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setQuizzes(data.quizzes);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [getToken]);

  if (loading) {
    return (
      <div className="text-sm text-text-secondary">
        Loading quizzes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            My Quizzes
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Create and manage your quizzes.
          </p>
        </div>

        <Link
  to="/instructor/quizzes/create"
  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#8B5CF6] px-4 text-sm font-medium text-white hover:bg-[#7C3AED]"
>
  <Plus size={16} />
  Create Quiz
</Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <BookOpen
            size={28}
            className="mx-auto text-text-secondary"
          />

          <h3 className="mt-3 font-medium text-text-primary">
            No quizzes yet
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Create your first quiz to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="rounded-xl border border-border bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-text-primary">
                    {quiz.title}
                  </h3>

                  <p className="mt-1 text-sm text-text-secondary">
                    {quiz.questions?.length || 0} questions
                  </p>
                </div>

                <span className="rounded-full bg-surface px-2.5 py-1 text-xs capitalize text-text-secondary">
                  {quiz.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs capitalize text-text-secondary">
                  {quiz.settings?.quizMode || "practice"}
                </span>

                <Link
                  to={`/instructor/results?quiz=${quiz._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8B5CF6] hover:text-[#7C3AED]"
                >
                  <BarChart3 size={15} />
                  Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorQuizzes;