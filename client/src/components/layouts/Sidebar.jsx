import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
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

  const navigation =
    role === "instructor"
      ? instructorNavigation
      : studentNavigation;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-border px-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            QuizForge
          </h1>

          <p className="truncate text-xs capitalize text-text-secondary">
            {role}
          </p>
        </div>
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

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
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

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs capitalize text-text-secondary">
              {role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;