import { useAuthContext } from "../../context/AuthContext";

function InstructorDashboard() {
  const { user } = useAuthContext();

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-text-primary">
        Welcome back, {user?.name || "Instructor"}
      </h2>

      <p className="mt-1 text-sm text-text-secondary">
        Here's what's happening with your quizzes.
      </p>
    </div>
  );
}

export default InstructorDashboard;