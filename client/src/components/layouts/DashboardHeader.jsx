import { Bell, Search } from "lucide-react";

function DashboardHeader({ title, description }) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
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
      </div>
    </header>
  );
}

export default DashboardHeader;