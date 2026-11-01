import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { createRoom, getMyRooms, getStudentRooms, joinRoom, removeRoomMember, deleteRoom } from "../controllers/roomController.js";

const router = express.Router();
router.use(protect);
router.post("/", requireRole("instructor"), createRoom);
router.get("/my", requireRole("instructor"), getMyRooms);
router.get("/joined", requireRole("student"), getStudentRooms);
router.post("/join", requireRole("student"), joinRoom);
router.delete("/:roomId/members/:studentId", requireRole("instructor"), removeRoomMember);
router.delete("/:roomId", requireRole("instructor"), deleteRoom);
export default router;
