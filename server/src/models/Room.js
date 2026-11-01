import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

roomSchema.index({ instructor: 1, createdAt: -1 });
roomSchema.index({ members: 1, isActive: 1 });

export default mongoose.model("Room", roomSchema);
