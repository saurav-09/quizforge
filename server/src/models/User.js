import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
      default: "student",
      index: true,
    },

    studentStats: {
      quizzesAttempted: {
        type: Number,
        default: 0,
      },

      averageScore: {
        type: Number,
        default: 0,
      },

      bestScore: {
        type: Number,
        default: 0,
      },

      completionRate: {
        type: Number,
        default: 0,
      },
    },

    instructorStats: {
      totalQuizzes: {
        type: Number,
        default: 0,
      },

      totalParticipants: {
        type: Number,
        default: 0,
      },

      totalAttempts: {
        type: Number,
        default: 0,
      },

      averageScoreAcrossQuizzes: {
        type: Number,
        default: 0,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model("User", userSchema);