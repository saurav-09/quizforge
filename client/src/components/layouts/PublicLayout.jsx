import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0D0B1A] text-[#F8FAFC]">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#8B5CF6]/15 blur-[140px] animate-ambient-float"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-[500px] h-[450px] w-[450px] rounded-full bg-[#6366F1]/10 blur-[140px] animate-ambient-float"
        style={{ animationDelay: "-8s" }}
      />

      <div className="relative z-10">
        <Navbar />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PublicLayout;