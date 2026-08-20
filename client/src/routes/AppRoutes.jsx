import { Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layouts/PublicLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";

import Landing from "../pages/Landing";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Instructor */}
      <Route
        path="/instructor"
        element={<DashboardLayout role="instructor" />}
      >
        <Route index element={<InstructorDashboard />} />
      </Route>

      {/* Student */}
      <Route
        path="/student"
        element={<DashboardLayout role="student" />}
      >
        <Route index element={<StudentDashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;