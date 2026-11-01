import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) => options.length >= 2,
        message: "A question must have at least 2 options",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    topic: { type: String, default: "General", trim: true, maxlength: 100 },
    subtopic: { type: String, default: "", trim: true, maxlength: 100 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    assignedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    settings: {
      timeLimit: {
        type: Number,
        default: 30,
        min: 1,
      },

      attemptsAllowed: {
        type: Number,
        default: 1,
        min: 1,
      },

      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      allowBackNavigation: { type: Boolean, default: true },
      negativeMarkingEnabled: { type: Boolean, default: false },
      negativeMarkingPoints: { type: Number, default: 0, min: 0 },
      unlimitedAttempts: { type: Boolean, default: false },

      quizMode: {
        type: String,
        enum: ["practice", "test"],
        default: "practice",
      },
    },

    // Used for scheduled tests
    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null,
    },

    // Used later for Test result sharing
    resultsShared: {
      type: Boolean,
      default: false,
    },

    resultsSharedAt: {
      type: Date,
      default: null,
    },

    accessCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({
  creator: 1,
  createdAt: -1,
});

quizSchema.index({
  status: 1,
  createdAt: -1,
});

quizSchema.index({
  startTime: 1,
  endTime: 1,
});

export default mongoose.model("Quiz", quizSchema);