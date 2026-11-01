import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null);
      setIsLoadingUser(false);
      return;
    }

    setIsLoadingUser(true);

    try {
      const token = await getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      let response = await fetch("/api/user/me", { headers });

      // First-time Clerk users need a QuizForge database record.
      if (response.status === 404) {
        const syncResponse = await fetch("/api/user/sync", {
          method: "POST",
          headers,
        });

        const syncData = await syncResponse.json();

        if (!syncResponse.ok) {
          throw new Error(syncData.message || "Failed to sync account");
        }

        response = await fetch("/api/user/me", { headers });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your account");
      }

      setUser(data.user);
    } catch (error) {
      console.error("Fetch current user error:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchCurrentUser();
    }
  }, [isLoaded, fetchCurrentUser]);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded || isLoadingUser,
    refreshUser: fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
