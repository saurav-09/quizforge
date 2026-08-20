import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

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
  const navigation =
  role === "instructor"
    ? instructorNavigation
    : studentNavigation;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            QuizForge
          </h1>
         <p className="truncate text-xs text-text-secondary">
  {role === "instructor" ? "Instructor" : "Student"}
</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.path}
              href={item.path}
              className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
            >
              <Icon size={17} strokeWidth={1.8} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-medium text-white">
            S
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              Saurav
            </p>
            <p className="truncate text-xs text-text-secondary">
              Instructor
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;