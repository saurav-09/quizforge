import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layouts/DashboardLayout";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>QuizForge Landing</div>} />

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

      {/* Everything else */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;