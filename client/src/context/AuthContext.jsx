import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (!isSignedIn) {
        setUser(null);
        return;
      }

      const token = await getToken();

      const response = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch current user");
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      console.error("Fetch current user error:", error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    fetchCurrentUser();
  }, [isLoaded, isSignedIn]);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: isSignedIn,
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
    throw new Error(
      "useAuthContext must be used inside AuthProvider"
    );
  }

  return context;
}