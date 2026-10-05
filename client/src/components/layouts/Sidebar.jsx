import {
  BarChart3,
  BookOpen,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useClerk } from "@clerk/react";
import { useAuthContext } from "../../context/AuthContext";

const instructorNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/instructor",
  },
  {
    label: "My Quizzes",
    icon: BookOpen,
    path: "/instructor/quizzes",
  },
  {
    label: "Live Sessions",
    icon: Users,
    path: "/instructor/live",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/instructor/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/instructor/settings",
  },
];

const studentNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/student",
  },
  {
    label: "My Quizzes",
    icon: BookOpen,
    path: "/student/quizzes",
  },
  {
    label: "Join Quiz",
    icon: Users,
    path: "/student/join",
  },
  {
    label: "My Results",
    icon: BarChart3,
    path: "/student/results",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/student/settings",
  },
];

function Sidebar({ role = "instructor" }) {
  const { user } = useAuthContext();
  const { signOut } = useClerk();

  const navigation =
    role === "instructor"
      ? instructorNavigation
      : studentNavigation;

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link to="/" className="block">
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            QuizForge
          </h1>

          <p className="truncate text-xs capitalize text-text-secondary">
            {role}
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
            >
              <Icon size={17} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Home */}
      <div className="px-3 pb-2">
        <Link
          to="/"
          className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
        >
          <Home size={17} strokeWidth={1.8} />
          Home
        </Link>
      </div>

      {/* User + Logout */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs capitalize text-text-secondary">
              {role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
        >
          <LogOut size={17} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;