import { ArrowUpRight } from "lucide-react";

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-brand">
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-text-primary">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        </div>

        <ArrowUpRight
          size={17}
          className="shrink-0 text-text-secondary transition-colors group-hover:text-brand"
        />
      </div>
    </div>
  );
}

export default FeatureCard;