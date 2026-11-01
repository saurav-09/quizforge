import crypto from "node:crypto";
import Room from "../models/Room.js";

const makeCode = () => crypto.randomBytes(5).toString("hex").toUpperCase();

export const createRoom = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ success: false, message: "Room name is required" });
    let room;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        room = await Room.create({ name, description: req.body.description || "", instructor: req.user._id, code: makeCode() });
        break;
      } catch (error) {
        if (error?.code !== 11000 || attempt === 4) throw error;
      }
    }
    return res.status(201).json({ success: true, room });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({ success: false, message: "Unable to create room" });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ instructor: req.user._id, isActive: true }).populate("members", "name email avatarUrl").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load rooms" });
  }
};

export const getStudentRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id, isActive: true }).populate("instructor", "name").select("name description code instructor members createdAt").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load joined rooms" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    if (!/^[A-F0-9]{10}$/.test(code)) return res.status(400).json({ success: false, message: "Enter a valid room code" });
    const room = await Room.findOneAndUpdate(
      { code, isActive: true, members: { $ne: req.user._id } },
      { $addToSet: { members: req.user._id } },
      { new: true }
    ).populate("instructor", "name");
    if (!room) {
      const existing = await Room.findOne({ code, isActive: true, members: req.user._id }).populate("instructor", "name");
      if (existing) return res.json({ success: true, alreadyMember: true, room: existing });
      return res.status(404).json({ success: false, message: "Room code not found or room is inactive" });
    }
    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("Join room error:", error);
    return res.status(500).json({ success: false, message: "Unable to join room" });
  }
};

export const removeRoomMember = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.roomId, instructor: req.user._id },
      { $pull: { members: req.params.studentId } },
      { new: true }
    ).populate("members", "name email avatarUrl");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    return res.json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to remove room member" });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.roomId, instructor: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    return res.json({ success: true, message: "Room archived" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to archive room" });
  }
};
