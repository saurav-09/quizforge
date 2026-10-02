import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";

function AuthRedirect() {
  const { user, isAuthenticated, isLoading, refreshUser } =
    useAuthContext();

  const { getToken } = useAuth();

  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    const sync = async () => {
      if (!isAuthenticated || isLoading) return;

      try {
        setSyncing(true);

        const token = await getToken();

        const response = await fetch("/api/user/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to sync user"
          );
        }

        await refreshUser();
      } catch (error) {
        console.error("User sync error:", error);
        setSyncError(error.message);
      } finally {
        setSyncing(false);
      }
    };

    sync();
  }, [isAuthenticated, isLoading, getToken, refreshUser]);

  if (isLoading || syncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (syncError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {syncError}
        </div>
      </div>
    );
  }

  if (!user?.role) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.role === "instructor") {
    return <Navigate to="/instructor" replace />;
  }

  if (user.role === "student") {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/onboarding" replace />;
}

export default AuthRedirect;