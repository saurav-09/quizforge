import express from "express";
import {
  startQuiz,
  saveQuizProgress,
  submitQuiz,
} from "../controllers/quizAttemptController.js";
import {
  protect,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(requireRole("student"));

router.post("/:quizId/start", startQuiz);

router.patch("/:attemptId/answers", saveQuizProgress);

router.post("/:attemptId/submit", submitQuiz);

export default router;