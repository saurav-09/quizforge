import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "For instructors", href: "#for-instructors" },
      { label: "For students", href: "#for-students" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Get started", href: "/register" },
    ],
  },
];

function FooterLink({ link }) {
  if (link.href.startsWith("#")) {
    return (
      <a
        href={link.href}
        className="group inline-flex items-center gap-1 text-xs text-[#64748B] transition-colors duration-200 hover:text-[#F8FAFC]"
      >
        {link.label}

        <ArrowUpRight
          size={11}
          className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </a>
    );
  }

  return (
    <Link
      to={link.href}
      className="group inline-flex items-center gap-1 text-xs text-[#64748B] transition-colors duration-200 hover:text-[#F8FAFC]"
    >
      {link.label}

      <ArrowUpRight
        size={11}
        className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_2fr] lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-xs font-bold text-white shadow-[0_6px_20px_rgba(139,92,246,0.2)]">
                Q
              </span>

              <span className="font-display text-base font-semibold tracking-tight text-[#F8FAFC]">
                QuizForge
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-xs leading-5 text-[#64748B]">
              AI-powered real-time quizzes and assessments built for
              better learning.
            </p>
          </div>

          {/* Links */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                {group.title}
              </h3>

              <nav className="mt-3 flex flex-col items-start gap-2.5">
                {group.links.map((link) => (
                  <FooterLink
                    key={link.label}
                    link={link}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#475569]">
            © {new Date().getFullYear()} QuizForge. All rights reserved.
          </p>

          <p className="text-[10px] text-[#475569]">
            Create. Share. Assess. Understand.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;