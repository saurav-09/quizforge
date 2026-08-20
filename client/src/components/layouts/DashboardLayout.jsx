import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

function DashboardLayout({ role = "instructor" }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role={role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title={role === "instructor" ? "Instructor Dashboard" : "Student Dashboard"}
        />

        <main className="flex-1 bg-white p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;