import mongoose from "mongoose";

const questionBankItemSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  question: { type: String, required: true, trim: true, maxlength: 3000 },
  questionType: { type: String, enum: ["mcq"], default: "mcq" },
  options: {
    type: [String], required: true,
    validate: { validator: (items) => items.length >= 2 && items.every((item) => item.trim()), message: "At least two non-empty options are required" },
  },
  correctAnswer: { type: String, required: true, trim: true },
  explanation: { type: String, default: "", trim: true },
  topic: { type: String, required: true, trim: true, maxlength: 100 },
  subtopic: { type: String, default: "", trim: true, maxlength: 100 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  points: { type: Number, default: 1, min: 1 },
}, { timestamps: true });

questionBankItemSchema.index({ instructor: 1, topic: 1, difficulty: 1, createdAt: -1 });
questionBankItemSchema.index({ instructor: 1, question: "text", topic: "text", subtopic: "text" });

export default mongoose.model("QuestionBankItem", questionBankItemSchema);
