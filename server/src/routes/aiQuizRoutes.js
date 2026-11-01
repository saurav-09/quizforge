import express from "express";
import { generateQuizQuestions } from "../controllers/aiQuizController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/generate-quiz",
  protect,
  requireRole("instructor"),
  generateQuizQuestions
);

export default router;
