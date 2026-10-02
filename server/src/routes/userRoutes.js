import express from "express";

import {
  syncUser,
  updateUserRole,
  getCurrentUser,
} from "../controllers/userController.js";

import {
  protect,
  requireClerkAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", requireClerkAuth, syncUser);

router.get("/me", protect, getCurrentUser);

router.patch("/role", protect, updateUserRole);

export default router;