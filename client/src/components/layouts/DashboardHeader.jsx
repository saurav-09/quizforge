import { Bell, ChevronDown, LogOut, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useClerk } from "@clerk/react";
import { useAuthContext } from "../../context/AuthContext";

function DashboardHeader({ title, description }) {
  const { user, role } = useAuthContext();
  const { signOut } = useClerk();

  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardPath =
    role === "instructor" ? "/instructor" : "/student";

  const handleLogout = async () => {
    setProfileOpen(false);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="relative flex min-h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-text-primary">
          {title}
        </h1>

        {description && (
          <p className="mt-0.5 text-sm text-text-secondary">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-text-secondary hover:bg-surface sm:flex"
        >
          <Search size={16} />
          Search
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* Profile */}
        <div className="relative ml-1 border-l border-border pl-3">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p className="max-w-[120px] truncate text-xs font-medium text-text-primary">
                {user?.name || "User"}
              </p>

              <p className="text-[10px] capitalize text-text-secondary">
                {role || "user"}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-text-secondary transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-border bg-white p-1.5 shadow-lg">
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs capitalize text-text-secondary">
                  {role || "user"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  <User size={16} />
                  Profile
                </Link>

                <Link
                  to={dashboardPath}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  <Search size={16} />
                  Dashboard
                </Link>
              </div>

              <div className="border-t border-border pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;