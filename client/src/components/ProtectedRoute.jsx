import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const {
    isAuthenticated,
    isLoading,
    role,
  } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "instructor") {
      return <Navigate to="/instructor" replace />;
    }

    return <Navigate to="/student" replace />;
  }

  return children;
}

export default ProtectedRoute;