import express from "express";
import {
  createQuiz,
  getMyQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  getQuizResults,
  completeQuiz,
  shareQuizResults,
} from "../controllers/quizController.js";

import {
  protect,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("instructor"),
  createQuiz
);

router.get(
  "/my",
  protect,
  requireRole("instructor"),
  getMyQuizzes
);

router.get(
  "/:id",
  protect,
  getQuiz
);

router.get(
  "/:id/results",
  protect,
  requireRole("instructor"),
  getQuizResults
);

router.patch(
  "/:id/complete",
  protect,
  requireRole("instructor"),
  completeQuiz
);

router.post(
  "/:id/share-results",
  protect,
  requireRole("instructor"),
  shareQuizResults
);

router.patch(
  "/:id",
  protect,
  requireRole("instructor"),
  updateQuiz
);

router.delete(
  "/:id",
  protect,
  requireRole("instructor"),
  deleteQuiz
);

router.patch(
  "/:id/publish",
  protect,
  requireRole("instructor"),
  publishQuiz
);

export default router;