import { Link } from "react-router-dom";

function InstructorDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-brand-violet">
          Instructor
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Create quizzes, manage assessments, and view student performance.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Quick Actions
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/instructor/quizzes/create"
            className="rounded-card border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-brand-violet/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-violet/10 text-xl">
              ✨
            </div>

            <h3 className="mt-5 text-base font-semibold text-text-primary">
              Create Quiz
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Create a new quiz or assessment for your students.
            </p>
          </Link>

          <Link
            to="/instructor/quizzes"
            className="rounded-card border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-brand-violet/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-indigo/10 text-xl">
              📝
            </div>

            <h3 className="mt-5 text-base font-semibold text-text-primary">
              Manage Quizzes
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              View, edit, publish, and manage your quizzes.
            </p>
          </Link>

          <Link
            to="/instructor/results"
            className="rounded-card border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-brand-violet/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-xl">
              📊
            </div>

            <h3 className="mt-5 text-base font-semibold text-text-primary">
              View Results
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Analyze student performance and quiz results.
            </p>
          </Link>
        </div>
      </div>

      {/* Results Flow */}
      <div className="rounded-card border border-border bg-surface p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Student Performance
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              View quiz-level analytics and open individual student attempts
              to review their answers and performance.
            </p>
          </div>

          <Link
            to="/instructor/results"
            className="shrink-0 rounded-button bg-brand-violet px-5 py-2.5 text-center text-sm font-medium text-white transition hover:opacity-90"
          >
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;