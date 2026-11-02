import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { listQuestionBank, createQuestionBankItem, updateQuestionBankItem, deleteQuestionBankItem } from "../controllers/questionBankController.js";

const router = express.Router();
router.use(protect, requireRole("instructor"));
router.get("/", listQuestionBank);
router.post("/", createQuestionBankItem);
router.patch("/:questionId", updateQuestionBankItem);
router.delete("/:questionId", deleteQuestionBankItem);
export default router;
