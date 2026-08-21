import { useAuthContext } from "../../context/AuthContext";

function StudentDashboard() {
  const { user } = useAuthContext();

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-text-primary">
        Welcome back, {user?.name || "Student"}
      </h2>

      <p className="mt-1 text-sm text-text-secondary">
        Track your quiz performance and recent activity.
      </p>
    </div>
  );
}

export default StudentDashboard;