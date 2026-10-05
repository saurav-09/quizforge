import { Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layouts/PublicLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Landing from "../pages/Landing";
import Onboarding from "../pages/Onboarding";

import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import InstructorResults from "../pages/instructor/InstructorResults";
import InstructorQuizResults from "../pages/instructor/InstructorQuizResults";
import InstructorQuizzes from "../pages/instructor/InstructorQuizzes";
import CreateQuiz from "../pages/instructor/CreateQuiz";
import CreateQuizQuestions from "../pages/instructor/CreateQuizQuestions";
import CreateQuizSettings from "../pages/instructor/CreateQuizSettings";
import CreateQuizPreview from "../pages/instructor/CreateQuizPreview";
import InstructorAttemptResult from "../pages/instructor/InstructorAttemptResult";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentQuizzes from "../pages/student/StudentQuizzes";
import StudentQuizDetails from "../pages/student/StudentQuizDetails";
import StudentQuizAttempt from "../pages/student/StudentQuizAttempt";
import StudentQuizResult from "../pages/student/StudentQuizResult";
import StudentResults from "../pages/student/StudentResults";
import StudentJoinQuiz from "../pages/student/StudentJoinQuiz";

import ProtectedRoute from "../components/ProtectedRoute";

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
        <Route path="results" element={<InstructorResults />} />
        <Route
  path="results/:quizId"
  element={<InstructorQuizResults />}
/>
<Route
  path="results/:quizId/attempt/:attemptId"
  element={<InstructorAttemptResult />}
/>
        <Route path="quizzes" element={<InstructorQuizzes />} />
        <Route path="quizzes/create" element={<CreateQuiz />} />
        <Route
          path="quizzes/create/questions"
          element={<CreateQuizQuestions />}
        />
        <Route
          path="quizzes/create/settings"
          element={<CreateQuizSettings />}
        />
        <Route
          path="quizzes/create/preview"
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

  <Route
    path="quizzes"
    element={<StudentQuizzes />}
  />

  <Route
    path="quizzes/:quizId"
    element={<StudentQuizDetails />}
  />

  <Route
    path="quizzes/:quizId/attempt/:attemptId"
    element={<StudentQuizAttempt />}
  />

  <Route
  path="join"
  element={<StudentJoinQuiz />}
/>

  <Route
    path="results"
    element={<StudentResults />}
  />

  <Route
    path="results/:attemptId"
    element={<StudentQuizResult />}
  />
</Route>

      {/* Temporary profile route */}
      <Route path="/profile" element={<Profile />} />

      {/* 404 */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;