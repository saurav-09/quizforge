import express from "express";

import {
  startQuiz,
  getQuizAttempt,
  getQuizAttemptResult,
  getMyQuizAttempts,
  saveQuizProgress,
  submitQuiz,
} from "../controllers/quizAttemptController.js";

import {
  protect,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All quiz-attempt routes require:
|
| 1. Authentication
| 2. Student role
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(requireRole("student"));

/*
|--------------------------------------------------------------------------
| Start Quiz
|--------------------------------------------------------------------------
*/

router.post(
  "/:quizId/start",
  startQuiz
);

/*
|--------------------------------------------------------------------------
| Get / Resume Attempt
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  getMyQuizAttempts
);

router.get(
  "/:attemptId",
  getQuizAttempt
);

/*
|--------------------------------------------------------------------------
| Get Submitted Result
|--------------------------------------------------------------------------
*/

router.get(
  "/:attemptId/result",
  getQuizAttemptResult
);

/*
|--------------------------------------------------------------------------
| Save Progress
|--------------------------------------------------------------------------
*/

router.patch(
  "/:attemptId/answers",
  saveQuizProgress
);

/*
|--------------------------------------------------------------------------
| Submit Quiz
|--------------------------------------------------------------------------
*/

router.post(
  "/:attemptId/submit",
  submitQuiz
);

export default router;