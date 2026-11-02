import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { sendQuizResultEmail } from "../utils/emailService.js";
import crypto from "crypto";
import Room from "../models/Room.js";
import User from "../models/User.js";

const quizModeForAssignment = (settings) => settings?.quizMode || "practice";

const generateAccessCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      settings,
      assignedRooms = [],
      assignedStudents = [],
      startTime: requestedStartTime,
      endTime: requestedEndTime,
    } = req.body;

    /*
     * -------------------------------------------------------
     * Validate title
     * -------------------------------------------------------
     */

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (!Array.isArray(assignedRooms) || !Array.isArray(assignedStudents)) {
      return res.status(400).json({ success: false, message: "Invalid practice assignments" });
    }

    if (assignedRooms.length === 0 && assignedStudents.length === 0) {
      return res.status(400).json({ success: false, message: "Assign this quiz to at least one class or student" });
    }

    /*
     * -------------------------------------------------------
     * Validate questions
     * -------------------------------------------------------
     */

    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      });
    }

    /*
     * -------------------------------------------------------
     * Validate quiz mode
     * -------------------------------------------------------
     */

    const quizMode =
      settings?.quizMode || "practice";

    if (
      !["practice", "test"].includes(quizMode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz mode",
      });
    }

    /*
     * -------------------------------------------------------
     * Validate time limit
     * -------------------------------------------------------
     */

    const timeLimit =
      Number(settings?.timeLimit ?? 30);

    if (
      !Number.isFinite(timeLimit) ||
      timeLimit < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid time limit",
      });
    }

    /*
     * -------------------------------------------------------
     * Validate attempts
     * -------------------------------------------------------
     */

    const attemptsAllowed =
      Number(settings?.attemptsAllowed ?? 1);

    if (
      !Number.isInteger(attemptsAllowed) ||
      attemptsAllowed < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempts allowed must be at least 1",
      });
    }

    /*
     * -------------------------------------------------------
     * Validate each question
     * -------------------------------------------------------
     */

    for (const question of questions) {
      if (!question?.question?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Every question must have text",
        });
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Every question must have at least two options",
        });
      }

      const options =
        question.options.map((option) =>
          String(option).trim()
        );

      if (
        options.some(
          (option) => !option
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question options cannot be empty",
        });
      }

      if (
        !options.includes(
          question.correctAnswer
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Correct answer must match one of the question options",
        });
      }

      const points =
        Number(question.points);

      if (
        !Number.isFinite(points) ||
        points <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question points must be greater than 0",
        });
      }
    }

    /*
     * -------------------------------------------------------
     * Handle test schedule
     * -------------------------------------------------------
     */

    let quizStartTime = null;
    let quizEndTime = null;

    if (quizMode === "test") {
      if (requestedStartTime) {
        quizStartTime = new Date(requestedStartTime);
        if (Number.isNaN(quizStartTime.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid test start time" });
        }
      }
      if (requestedEndTime) {
        quizEndTime = new Date(requestedEndTime);
        if (Number.isNaN(quizEndTime.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid test end time" });
        }
      }
      if (quizStartTime && quizEndTime && quizEndTime <= quizStartTime) {
        return res.status(400).json({ success: false, message: "Test end time must be after its start time" });
      }
    }

    /*
     * -------------------------------------------------------
     * Generate access code for test quizzes
     * -------------------------------------------------------
     */

    let accessCode;

    if (quizMode === "test") {
      do {
        accessCode = generateAccessCode();
      } while (await Quiz.exists({ accessCode }));
    }

    /*
     * -------------------------------------------------------
     * Create quiz
     * -------------------------------------------------------
     */

    const uniqueRoomIds = [...new Set(assignedRooms.map(String))];
    const ownedRoomCount = uniqueRoomIds.length ? await Room.countDocuments({ _id: { $in: uniqueRoomIds }, instructor: req.user._id, isActive: true }) : 0;
    if (ownedRoomCount !== uniqueRoomIds.length) return res.status(403).json({ success: false, message: "You can only assign quizzes to classes you own" });
    const uniqueStudentIds = [...new Set(assignedStudents.map(String))];
    const validStudentCount = uniqueStudentIds.length
      ? await User.countDocuments({ _id: { $in: uniqueStudentIds }, role: "student", isActive: true })
      : 0;
    if (validStudentCount !== uniqueStudentIds.length) return res.status(400).json({ success: false, message: "Practice can only be assigned to active student accounts" });

    const quiz = await Quiz.create({
  title: title.trim(),
  assignedRooms: uniqueRoomIds,
  assignedStudents,

  description:
    description?.trim() || "",

  questions: questions.map(
    (question) => ({
      ...question,

      question:
        question.question.trim(),

      options:
        question.options.map(
          (option) =>
            String(option).trim()
        ),

      correctAnswer:
        question.correctAnswer,

      explanation:
        question.explanation?.trim() ||
        "",

      points:
        Number(question.points) || 1,
      topic: question.topic?.trim() || "General",
      subtopic: question.subtopic?.trim() || "",
      difficulty: ["easy", "medium", "hard"].includes(question.difficulty) ? question.difficulty : "medium",
    })
  ),

  settings: {
    timeLimit,
    attemptsAllowed,

    shuffleQuestions: Boolean(settings?.shuffleQuestions),
    shuffleOptions: Boolean(settings?.shuffleOptions),
    allowBackNavigation: settings?.allowBackNavigation !== false,
    negativeMarkingEnabled: Boolean(settings?.negativeMarkingEnabled),
    negativeMarkingPoints: settings?.negativeMarkingEnabled ? Math.max(0, Number(settings?.negativeMarkingPoints) || 0) : 0,
    unlimitedAttempts: settings?.unlimitedAttempts ?? quizMode === "practice",
    quizMode,
  },

  startTime: quizStartTime,
  endTime: quizEndTime,

  ...(quizMode === "test" && {
    accessCode,
  }),

  creator: req.user._id,
});

    /*
     * -------------------------------------------------------
     * Response
     * -------------------------------------------------------
     */

    return res.status(201).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error(
      "Create quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getInstructorAnalytics = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user._id })
      .select("title status settings questions createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const quizIds = quizzes.map((quiz) => quiz._id);
    const attempts = quizIds.length
      ? await QuizAttempt.find({ quiz: { $in: quizIds }, status: "submitted" })
          .populate("student", "name")
          .select("quiz score totalPoints percentage submittedAt")
          .lean()
      : [];

    const totalAttempts = attempts.length;
    const averageScore = totalAttempts
      ? Number((attempts.reduce((sum, item) => sum + (item.percentage || 0), 0) / totalAttempts).toFixed(2))
      : 0;
    const quizPerformance = quizzes.map((quiz) => {
      const quizAttempts = attempts.filter((attempt) => attempt.quiz.toString() === quiz._id.toString());
      const average = quizAttempts.length
        ? Number((quizAttempts.reduce((sum, item) => sum + (item.percentage || 0), 0) / quizAttempts.length).toFixed(2))
        : 0;
      return {
        quizId: quiz._id,
        title: quiz.title,
        mode: quiz.settings?.quizMode || "practice",
        status: quiz.status,
        totalQuestions: quiz.questions?.length || 0,
        participants: quizAttempts.length,
        averagePercentage: average,
        passed: quizAttempts.filter((item) => item.percentage >= 50).length,
        needsImprovement: quizAttempts.filter((item) => item.percentage < 50).length,
      };
    });

    const activeParticipants = quizIds.length
      ? await QuizAttempt.countDocuments({ quiz: { $in: quizIds }, status: "in-progress" })
      : 0;

    return res.json({
      success: true,
      overview: {
        totalQuizzes: quizzes.length,
        publishedQuizzes: quizzes.filter((quiz) => quiz.status === "published").length,
        totalAttempts,
        activeParticipants,
        averagePercentage: averageScore,
        passed: attempts.filter((item) => item.percentage >= 50).length,
        needsImprovement: attempts.filter((item) => item.percentage < 50).length,
      },
      quizPerformance,
    });
  } catch (error) {
    console.error("Instructor analytics error:", error);
    return res.status(500).json({ success: false, message: "Unable to load instructor analytics" });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      creator: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    /*
     * -------------------------------------------------------
     * VALIDATE USER ROLE
     * -------------------------------------------------------
     */

    if (!["student", "instructor"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }

    /*
     * -------------------------------------------------------
     * STUDENT ACCESS
     * -------------------------------------------------------
     *
     * Practice quizzes:
     * - Published quizzes can be accessed normally.
     *
     * Test quizzes:
     * - Must be accessed through the join code.
     * - Direct quiz ID access is blocked.
     */

    if (req.user.role === "student") {
      if (quiz.status !== "published") {
        return res.status(403).json({
          success: false,
          message: "This quiz is not available",
        });
      }

      const isAssignedDirectly = (quiz.assignedStudents || []).some((id) => id.toString() === req.user._id.toString());
      const isRoomMember = (quiz.assignedRooms || []).length > 0 && await Room.exists({ _id: { $in: quiz.assignedRooms }, members: req.user._id, isActive: true });
      const joinedByCode = (quiz.registeredStudents || []).some((id) => id.toString() === req.user._id.toString());
      if (!isAssignedDirectly && !isRoomMember && !joinedByCode) return res.status(403).json({ success: false, message: "This quiz is not assigned to you. Join the test using its code or QR." });

      quiz.questions = quiz.questions.map((question) => ({
        _id: question._id,
        question: question.question,
        options: question.options,
        points: question.points,
        topic: question.topic,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
      }));
    }

    /*
     * -------------------------------------------------------
     * INSTRUCTOR ACCESS
     * -------------------------------------------------------
     *
     * Instructor can only access their own quiz.
     */

    if (req.user.role === "instructor") {
      const isOwner =
        quiz.creator?.toString() ===
        req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to access this quiz",
        });
      }
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

   if (
  quiz.status === "archived" ||
  quiz.status === "completed"
) {
  return res.status(400).json({
    success: false,
    message: "Completed or archived quiz cannot be updated",
  });
}

    const {
      title,
      description,
      questions,
      settings,
      assignedRooms = [],
      assignedStudents = [],
      startTime: requestedStartTime,
      endTime: requestedEndTime,
    } = req.body;

    if (!Array.isArray(assignedRooms) || !Array.isArray(assignedStudents)) {
      return res.status(400).json({ success: false, message: "Invalid quiz assignments" });
    }
    if (assignedRooms.length === 0 && assignedStudents.length === 0) {
      return res.status(400).json({ success: false, message: "Assign this quiz to at least one class or student" });
    }

    /*
     * Validate title
     */

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    /*
     * Validate questions
     */

    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      });
    }

    /*
     * Validate quiz mode
     */

    const quizMode =
      settings?.quizMode || "practice";

    if (
      !["practice", "test"].includes(
        quizMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz mode",
      });
    }

    /*
     * Validate time limit
     */

    const timeLimit =
      Number(settings?.timeLimit ?? 30);

    if (
      !Number.isFinite(timeLimit) ||
      timeLimit < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid time limit",
      });
    }

    /*
     * Validate attempts
     */

    const attemptsAllowed =
      Number(
        settings?.attemptsAllowed
      );

    if (
      !Number.isInteger(
        attemptsAllowed
      ) ||
      attemptsAllowed < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempts allowed must be at least 1",
      });
    }

    /*
     * Validate questions
     */

    for (const question of questions) {
      if (!question?.question?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Every question must have text",
        });
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Every question must have at least two options",
        });
      }

      const options =
        question.options.map((option) =>
          String(option).trim()
        );

      if (
        options.some(
          (option) => !option
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question options cannot be empty",
        });
      }

      const correctAnswer =
        String(
          question.correctAnswer || ""
        ).trim();

      if (!options.includes(correctAnswer)) {
        return res.status(400).json({
          success: false,
          message:
            "Correct answer must match one of the question options",
        });
      }

      const points =
        Number(question.points);

      if (
        !Number.isFinite(points) ||
        points <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Question points must be greater than 0",
        });
      }
    }

    /*
     * Handle test schedule
     */

    let quizStartTime = null;
    let quizEndTime = null;

    if (quizMode === "test") {
      if (requestedStartTime) {
        quizStartTime = new Date(requestedStartTime);
        if (Number.isNaN(quizStartTime.getTime())) return res.status(400).json({ success: false, message: "Invalid test start time" });
      }
      if (requestedEndTime) {
        quizEndTime = new Date(requestedEndTime);
        if (Number.isNaN(quizEndTime.getTime())) return res.status(400).json({ success: false, message: "Invalid test end time" });
      }
      if (quizStartTime && quizEndTime && quizEndTime <= quizStartTime) return res.status(400).json({ success: false, message: "Test end time must be after its start time" });
    }

    /*
     * Update quiz
     */

    const uniqueRoomIds = [...new Set(assignedRooms.map(String))];
    const ownedRoomCount = uniqueRoomIds.length ? await Room.countDocuments({ _id: { $in: uniqueRoomIds }, instructor: req.user._id, isActive: true }) : 0;
    if (ownedRoomCount !== uniqueRoomIds.length) return res.status(403).json({ success: false, message: "You can only assign quizzes to classes you own" });
    const uniqueStudentIds = [...new Set(assignedStudents.map(String))];
    const validStudentCount = uniqueStudentIds.length
      ? await User.countDocuments({ _id: { $in: uniqueStudentIds }, role: "student", isActive: true })
      : 0;
    if (validStudentCount !== uniqueStudentIds.length) return res.status(400).json({ success: false, message: "Practice can only be assigned to active student accounts" });

    quiz.title = title.trim();

    quiz.description =
      description?.trim() || "";

    quiz.assignedRooms = uniqueRoomIds;
    quiz.assignedStudents = assignedStudents;

    quiz.questions = questions.map(
      (question) => ({
        ...(question._id && {
          _id: question._id,
        }),
        question:
          question.question.trim(),
        options:
          question.options.map((option) =>
            String(option).trim()
          ),
        correctAnswer:
          String(
            question.correctAnswer
          ).trim(),
        explanation:
          question.explanation?.trim() ||
          "",
        points: Number(question.points),
        topic: question.topic?.trim() || "General",
        subtopic: question.subtopic?.trim() || "",
        difficulty: ["easy", "medium", "hard"].includes(question.difficulty) ? question.difficulty : "medium",
      })
    );

    quiz.settings = {
      timeLimit,
      attemptsAllowed,
      shuffleQuestions: Boolean(settings?.shuffleQuestions),
      shuffleOptions: Boolean(settings?.shuffleOptions),
      allowBackNavigation: settings?.allowBackNavigation !== false,
      negativeMarkingEnabled: Boolean(settings?.negativeMarkingEnabled),
      negativeMarkingPoints: settings?.negativeMarkingEnabled ? Math.max(0, Number(settings?.negativeMarkingPoints) || 0) : 0,
      unlimitedAttempts: settings?.unlimitedAttempts ?? quizMode === "practice",
      quizMode,
    };

    quiz.startTime = quizStartTime;
    quiz.endTime = quizEndTime;
    if (quizMode === "test" && !quiz.accessCode) {
      do {
        quiz.accessCode = generateAccessCode();
      } while (await Quiz.exists({ accessCode: quiz.accessCode, _id: { $ne: quiz._id } }));
    }
    if (quizMode === "practice") quiz.accessCode = undefined;

    await quiz.save();

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error(
      "Update quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const attemptCount = await QuizAttempt.countDocuments({
  quiz: quiz._id,
});

if (attemptCount > 0) {
  return res.status(400).json({
    success: false,
    message:
      "Quiz cannot be deleted because students have already attempted it",
  });
}

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    /*
     * -------------------------------------------------------
     * Only draft quizzes can be published
     * -------------------------------------------------------
     */

    if (quiz.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft quizzes can be published",
      });
    }

    /*
     * -------------------------------------------------------
     * Quiz must contain questions
     * -------------------------------------------------------
     */

    if (
      !Array.isArray(quiz.questions) ||
      quiz.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one question is required before publishing",
      });
    }

    /*
     * -------------------------------------------------------
     * Validate quiz mode
     * -------------------------------------------------------
     */

    const quizMode =
      quiz.settings?.quizMode;

    if (
      !["practice", "test"].includes(
        quizMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz mode",
      });
    }

    /*
     * -------------------------------------------------------
     * Test quiz must have a valid start time
     * -------------------------------------------------------
     */

    if (quizMode === "test" && quiz.startTime && quiz.endTime && new Date(quiz.endTime) <= new Date(quiz.startTime)) {
      return res.status(400).json({ success: false, message: "Test end time must be after its start time" });
    }

    /*
     * -------------------------------------------------------
     * Publish quiz
     * -------------------------------------------------------
     */

    if (quizMode === "test" && !quiz.accessCode) {
      do {
        quiz.accessCode = generateAccessCode();
      } while (await Quiz.exists({ accessCode: quiz.accessCode, _id: { $ne: quiz._id } }));
    }
    if (quizMode === "practice") quiz.accessCode = undefined;

    quiz.status = "published";

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz published successfully",
      quiz,
    });
  } catch (error) {
    console.error(
      "Publish quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getLiveTestMonitor = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      creator: req.user._id,
      "settings.quizMode": "test",
    }).populate("registeredStudents", "name email");

    if (!quiz) return res.status(404).json({ success: false, message: "Test not found" });

    const attempts = await QuizAttempt.find({ quiz: quiz._id })
      .populate("student", "name email")
      .select("student answers status submittedAt submissionType startedAt")
      .lean();

    const attemptsByStudent = new Map(
      attempts.filter((item) => item.student?._id).map((item) => [item.student._id.toString(), item])
    );

    const participants = (quiz.registeredStudents || []).map((student) => {
      const attempt = attemptsByStudent.get(student._id.toString());
      const answeredQuestions = (attempt?.answers || []).filter((answer) => answer.selectedAnswer !== null && answer.selectedAnswer !== undefined && answer.selectedAnswer !== "").length;
      const totalQuestions = quiz.questions.length;
      let status = "not-started";
      if (attempt?.status === "submitted") status = attempt.submissionType === "automatic" ? "expired" : "submitted";
      else if (attempt?.status === "in-progress") status = "in-progress";
      return {
        student: { _id: student._id, name: student.name, email: student.email },
        status,
        answeredQuestions,
        totalQuestions,
        unansweredQuestions: Math.max(0, totalQuestions - answeredQuestions),
        progressPercentage: totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
        startedAt: attempt?.startedAt || null,
        submittedAt: attempt?.submittedAt || null,
      };
    });

    return res.json({
      success: true,
      quiz: { _id: quiz._id, title: quiz.title, status: quiz.status, totalQuestions: quiz.questions.length },
      analytics: {
        participants: participants.length,
        notStarted: participants.filter((item) => item.status === "not-started").length,
        inProgress: participants.filter((item) => item.status === "in-progress").length,
        submitted: participants.filter((item) => item.status === "submitted").length,
        expired: participants.filter((item) => item.status === "expired").length,
      },
      participants,
    });
  } catch (error) {
    console.error("Live test monitor error:", error);
    return res.status(500).json({ success: false, message: "Unable to load live test progress" });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      creator: req.user._id,
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const attempts = await QuizAttempt.find({
      quiz: quiz._id,
      status: "submitted",
    })
      .populate("student", "name email")
      .sort({ submittedAt: -1 })
      .lean();

    const results = attempts.map((attempt) => ({
      attemptId: attempt._id,
      student: {
        _id: attempt.student?._id || null,
        name: attempt.student?.name || "Unknown Student",
        email: attempt.student?.email || "",
      },
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      timeTaken: attempt.timeTaken,
      submissionType: attempt.submissionType,
      submittedAt: attempt.submittedAt,
      startedAt: attempt.startedAt,
    }));

    const totalAttempts = results.length;
    const activeParticipants = await QuizAttempt.countDocuments({
      quiz: quiz._id,
      status: "in-progress",
    });

    const averagePercentage =
      totalAttempts > 0
        ? results.reduce(
            (sum, result) => sum + result.percentage,
            0
          ) / totalAttempts
        : 0;

    const highestPercentage =
      totalAttempts > 0
        ? Math.max(
            ...results.map(
              (result) => result.percentage
            )
          )
        : 0;

    const lowestPercentage =
      totalAttempts > 0
        ? Math.min(
            ...results.map(
              (result) => result.percentage
            )
          )
        : 0;

    const topicStats = new Map();
    for (const question of quiz.questions || []) {
      const topic = question.topic || "General";
      const stats = topicStats.get(topic) || { topic, questions: 0, correct: 0, answered: 0 };
      stats.questions += 1;
      for (const attempt of attempts) {
        const answer = (attempt.answers || []).find((item) => item.questionId?.toString() === question._id.toString());
        if (answer?.selectedAnswer !== null && answer?.selectedAnswer !== undefined && answer?.selectedAnswer !== "") {
          stats.answered += 1;
          if (answer.isCorrect) stats.correct += 1;
        }
      }
      topicStats.set(topic, stats);
    }
    const topicPerformance = [...topicStats.values()].map((item) => ({
      ...item,
      accuracy: item.answered ? Number(((item.correct / item.answered) * 100).toFixed(2)) : 0,
    }));

    res.status(200).json({
      success: true,

      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        status: quiz.status,
        quizMode: quiz.settings?.quizMode || "practice",
        resultsShared: quiz.resultsShared || false,
        totalQuestions: quiz.questions?.length || 0,
      },

      analytics: {
        totalAttempts,
        activeParticipants,
        averagePercentage: Number(
          averagePercentage.toFixed(2)
        ),
        highestPercentage: Number(
          highestPercentage.toFixed(2)
        ),
        lowestPercentage: Number(
          lowestPercentage.toFixed(2)
        ),
        passCount: results.filter((result) => result.percentage >= 50).length,
        needsImprovementCount: results.filter((result) => result.percentage < 50).length,
        topicPerformance,
      },

      results,
    });
  } catch (error) {
    console.error(
      "Get quiz results error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQuizAttemptResultForInstructor = async (req, res) => {
  try {
    const { id: quizId, attemptId } = req.params;

    // Make sure the quiz belongs to this instructor
    const quiz = await Quiz.findOne({
      _id: quizId,
      creator: req.user._id,
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Find the submitted attempt for this quiz
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      quiz: quiz._id,
      status: "submitted",
    })
      .populate("student", "name email")
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    // Create a quick lookup for the student's answers
    const answerMap = new Map();

    for (const answer of attempt.answers || []) {
      answerMap.set(answer.questionId.toString(), answer);
    }

    // Build question-by-question result
    const questions = quiz.questions.map((question) => {
      const studentAnswer = answerMap.get(
        question._id.toString()
      );

      return {
        questionId: question._id,
        question: question.question,
        options: question.options,

        selectedAnswer:
          studentAnswer?.selectedAnswer ?? null,

        correctAnswer: question.correctAnswer,

        isCorrect:
          studentAnswer?.isCorrect ?? false,

        points: question.points,

        pointsEarned:
          studentAnswer?.pointsEarned ?? 0,

        explanation:
          question.explanation || "",
      };
    });

    return res.status(200).json({
      success: true,

      result: {
        attemptId: attempt._id,

        student: {
          _id: attempt.student?._id || null,
          name: attempt.student?.name || "Unknown Student",
          email: attempt.student?.email || "",
        },

        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          quizMode: quiz.settings?.quizMode || "practice",
        },

        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,

        timeTaken: attempt.timeTaken,

        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,

        submissionType: attempt.submissionType,

        questions,
      },
    });
  } catch (error) {
    console.error(
      "Get instructor attempt result error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.settings.quizMode !== "test") {
      return res.status(400).json({
        success: false,
        message: "Only test quizzes can be completed this way",
      });
    }

    if (quiz.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Quiz is already completed",
      });
    }

    if (quiz.endTime && new Date() < quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: "Test time has not ended yet",
      });
    }

    quiz.status = "completed";

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Test completed successfully",
      quiz,
    });
  } catch (error) {
    console.error("Complete quiz error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const shareQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user._id });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    if (quiz.settings?.quizMode !== "test") return res.status(400).json({ success: false, message: "Results sharing is only available for tests" });
    if (quiz.status !== "completed") return res.status(400).json({ success: false, message: "Complete the test before releasing results" });
    if (quiz.resultsShared) return res.status(400).json({ success: false, message: "Results have already been released to everyone" });

    const requestedIds = Array.isArray(req.body.studentIds) && req.body.studentIds.length
      ? [...new Set(req.body.studentIds.map(String))]
      : null;
    const filter = { quiz: quiz._id, status: "submitted" };
    if (requestedIds) filter.student = { $in: requestedIds };
    const attempts = await QuizAttempt.find(filter).populate("student", "name email");
    if (!attempts.length) return res.status(400).json({ success: false, message: "No submitted results found for the selected students" });
    if (requestedIds && new Set(attempts.map((item) => item.student?._id?.toString()).filter(Boolean)).size !== requestedIds.length) {
      return res.status(400).json({ success: false, message: "One or more selected students do not have a submitted attempt" });
    }

    // Release access first. Email is a notification and must not control whether the result is visible.
    if (requestedIds) {
      const alreadyReleased = new Set((quiz.resultsReleasedTo || []).map((id) => id.toString()));
      quiz.resultsReleasedTo = [...new Set([...alreadyReleased, ...requestedIds])];
    } else {
      quiz.resultsShared = true;
      quiz.resultsSharedAt = new Date();
    }
    await quiz.save();

    let sent = 0;
    let failed = 0;
    for (const attempt of attempts) {
      if (!attempt.student?.email) { failed += 1; continue; }
      try {
        await sendQuizResultEmail({
          email: attempt.student.email,
          studentName: attempt.student.name,
          quizTitle: quiz.title,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          percentage: attempt.percentage,
        });
        sent += 1;
      } catch (error) {
        console.error(`Failed to send result email to ${attempt.student.email}:`, error);
        failed += 1;
      }
    }

    return res.status(200).json({
      success: true,
      message: requestedIds ? "Results released to selected students" : "Results released to all students",
      releasedCount: attempts.length,
      sent,
      failed,
      resultsShared: quiz.resultsShared,
    });
  } catch (error) {
    console.error("Share quiz results error:", error);
    return res.status(500).json({ success: false, message: "Failed to release quiz results" });
  }
};

export const getAvailableQuizzes = async (req, res) => {
  try {
    const joinedRooms = await Room.find({ members: req.user._id, isActive: true }).select("_id").lean();
    const roomIds = joinedRooms.map((room) => room._id);
    const quizzes = await Quiz.find({
      status: "published",
      $or: [
        { assignedRooms: { $in: roomIds } },
        { assignedStudents: req.user._id },
        { registeredStudents: req.user._id },
      ],
    })
      .select(
        "title description questions.question questions.options questions.points settings createdAt creator startTime endTime"
      )
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error(
      "Get available quizzes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available quizzes",
    });
  }
};

export const joinQuiz = async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Access code is required",
      });
    }

    const quiz = await Quiz.findOne({
      accessCode: accessCode.trim().toUpperCase(),
      status: "published",
      "settings.quizMode": "test",
    })
      .select(
        "title description questions.question questions.options questions.points settings startTime endTime creator"
      )
      .populate("creator", "name");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Invalid or unavailable quiz code",
      });
    }

    await Quiz.updateOne({ _id: quiz._id }, { $addToSet: { registeredStudents: req.user._id } });

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("Join quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join quiz",
    });
  }
};