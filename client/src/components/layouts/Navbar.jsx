import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../ui/Button";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

 const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "For instructors", href: "#for-instructors" },
  { label: "For students", href: "#for-students" },
];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0D0B1A]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] shadow-[0_6px_20px_rgba(139,92,246,0.25)]">
            <span className="text-sm font-bold text-white">Q</span>
          </div>

          <span className="font-display text-base font-semibold tracking-tight text-[#F8FAFC]">
            QuizForge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-[10px] px-3.5 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-[#F8FAFC]"
          >
            Log in
          </Link>

         <Link to="/register">
  <Button size="sm">
    Get started
  </Button>
</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.08] text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-[#F8FAFC] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-[#0D0B1A]/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-3 border-t border-white/[0.08] pt-3">
  <Link
    to="/login"
    onClick={() => setMobileOpen(false)}
    className="mb-2 block rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]"
  >
    Log in
  </Link>

  <Link
    to="/register"
    onClick={() => setMobileOpen(false)}
    className="block"
  >
    <Button size="sm" className="w-full">
      Get started
    </Button>
  </Link>
</div>
        </div>
      )}
    </header>
  );
}

export default Navbar;