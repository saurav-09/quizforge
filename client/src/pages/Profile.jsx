import { ArrowLeft, Mail, Shield, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useAuthContext } from "../context/AuthContext";

function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { role, user: quizForgeUser } = useAuthContext();

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-text-secondary">Loading profile...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary">
            You are not signed in
          </h1>

          <Link
            to="/login"
            className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const name =
    quizForgeUser?.name ||
    user.fullName ||
    user.firstName ||
    "User";

  const email =
    quizForgeUser?.email ||
    user.primaryEmailAddress?.emailAddress ||
    "No email available";

  const avatarUrl =
    quizForgeUser?.avatarUrl ||
    user.imageUrl ||
    null;

  const displayRole = role || quizForgeUser?.role || "User";

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          to={
            role === "instructor"
              ? "/instructor"
              : role === "student"
                ? "/student"
                : "/"
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Profile
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage your QuizForge account information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* Profile Header */}
          <div className="border-b border-border bg-surface px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-semibold text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {name}
                </h2>

                <p className="mt-0.5 text-sm capitalize text-text-secondary">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="divide-y divide-border">
            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-text-secondary">
                <User size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Name
                </p>

                <p className="mt-1 truncate text-sm font-medium text-text-primary">
                  {name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-text-secondary">
                <Mail size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Email
                </p>

                <p className="mt-1 truncate text-sm font-medium text-text-primary">
                  {email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-text-secondary">
                <Shield size={18} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Role
                </p>

                <p className="mt-1 text-sm font-medium capitalize text-text-primary">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;