import { Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layouts/PublicLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Landing from "../pages/Landing";
import Onboarding from "../pages/Onboarding";

import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";
import InstructorResults from "../pages/instructor/InstructorResults";
import ProtectedRoute from "../components/ProtectedRoute";
import InstructorQuizzes from "../pages/instructor/InstructorQuizzes";
import CreateQuiz from "../pages/instructor/CreateQuiz";
import CreateQuizQuestions from "../pages/instructor/CreateQuizQuestions";
import CreateQuizSettings from "../pages/instructor/CreateQuizSettings";
import CreateQuizPreview from "../pages/instructor/CreateQuizPreview";
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/onboarding" element={<Onboarding />} />

      {/* Instructor */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <DashboardLayout role="instructor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route
  path="/instructor/results"
  element={
    <ProtectedRoute allowedRoles={["instructor"]}>
      <InstructorResults />
    </ProtectedRoute>
  }
/>
<Route path="/instructor/quizzes" element={<InstructorQuizzes />} />
<Route path="/instructor/quizzes/create" element={<CreateQuiz />} />
<Route
  path="/instructor/quizzes/create/questions"
  element={<CreateQuizQuestions />}
/>
<Route
  path="/instructor/quizzes/create/settings"
  element={<CreateQuizSettings />}
/>
<Route
  path="/instructor/quizzes/create/preview"
  element={<CreateQuizPreview />}
/>
      </Route>

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
      </Route>

      {/* Temporary profile route */}
      <Route path="/profile" element={<Profile />} />

      {/* 404 */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;