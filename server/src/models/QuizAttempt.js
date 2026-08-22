import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    selectedAnswer: {
      type: String,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    pointsEarned: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    timeTaken: {
      type: Number,
      default: 0,
      min: 0,
    },

    submissionType: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },

    status: {
      type: String,
      enum: ["in-progress", "submitted"],
      default: "in-progress",
      index: true,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quiz: 1, student: 1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);