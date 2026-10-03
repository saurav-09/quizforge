import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { sendQuizResultEmail } from "../utils/emailService.js";

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      settings,
      startTime: requestedStartTime,
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
     * Validate time limit
     * -------------------------------------------------------
     */

    const timeLimit =
      Number(settings?.timeLimit);

    if (
      !Number.isFinite(timeLimit) ||
      timeLimit <= 0
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
      if (!requestedStartTime) {
        return res.status(400).json({
          success: false,
          message:
            "Test start time is required",
        });
      }

      quizStartTime =
        new Date(requestedStartTime);

      if (
        Number.isNaN(
          quizStartTime.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start time",
        });
      }

      quizEndTime = new Date(
        quizStartTime.getTime() +
          timeLimit * 60 * 1000
      );
    }

    /*
     * -------------------------------------------------------
     * Create quiz
     * -------------------------------------------------------
     */

    const quiz = await Quiz.create({
      title: title.trim(),

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
        })
      ),

      settings: {
        timeLimit,
        attemptsAllowed,
        shuffleQuestions:
          Boolean(
            settings?.shuffleQuestions
          ),
        showResults:
          quizMode === "practice"
            ? Boolean(
                settings?.showResults
              )
            : false,
        quizMode,
      },

      startTime: quizStartTime,

      endTime: quizEndTime,

      creator: req.user._id,
    });

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
     * STUDENT ACCESS
     * -------------------------------------------------------
     *
     * Students can only access published quizzes.
     * They should never receive correct answers or
     * explanations.
     */

    if (req.user.role === "student") {
      if (quiz.status !== "published") {
        return res.status(403).json({
          success: false,
          message: "This quiz is not available",
        });
      }

      quiz.questions = quiz.questions.map((question) => ({
        _id: question._id,
        question: question.question,
        options: question.options,
        points: question.points,
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

    if (!["student", "instructor"].includes(req.user.role)) {
  return res.status(403).json({
    success: false,
    message: "Invalid user role",
  });
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
      startTime: requestedStartTime,
    } = req.body;

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
      Number(settings?.timeLimit);

    if (
      !Number.isFinite(timeLimit) ||
      timeLimit <= 0
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
      if (!requestedStartTime) {
        return res.status(400).json({
          success: false,
          message:
            "Test start time is required",
        });
      }

      quizStartTime =
        new Date(requestedStartTime);

      if (
        Number.isNaN(
          quizStartTime.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start time",
        });
      }

      quizEndTime = new Date(
        quizStartTime.getTime() +
          timeLimit * 60 * 1000
      );
    }

    /*
     * Update quiz
     */

    quiz.title = title.trim();

    quiz.description =
      description?.trim() || "";

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
        points:
          Number(question.points),
      })
    );

    quiz.settings = {
      timeLimit,
      attemptsAllowed,
      shuffleQuestions:
        Boolean(
          settings?.shuffleQuestions
        ),
      showResults:
        quizMode === "practice"
          ? Boolean(
              settings?.showResults
            )
          : false,
      quizMode,
    };

    quiz.startTime = quizStartTime;
    quiz.endTime = quizEndTime;

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

    if (quizMode === "test") {
      if (!quiz.startTime) {
        return res.status(400).json({
          success: false,
          message:
            "Test start time is required before publishing",
        });
      }

      if (
        !quiz.endTime ||
        new Date(quiz.endTime) <=
          new Date(quiz.startTime)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Test end time is invalid",
        });
      }
    }

    /*
     * -------------------------------------------------------
     * Publish quiz
     * -------------------------------------------------------
     */

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
        averagePercentage: Number(
          averagePercentage.toFixed(2)
        ),
        highestPercentage: Number(
          highestPercentage.toFixed(2)
        ),
        lowestPercentage: Number(
          lowestPercentage.toFixed(2)
        ),
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

    // Result sharing is only available for test quizzes
    if (quiz.settings?.quizMode !== "test") {
      return res.status(400).json({
        success: false,
        message: "Results sharing is only available for test quizzes",
      });
    }

    // Test must be completed before results can be shared
    if (quiz.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Complete the test before sharing results",
      });
    }

    // Prevent duplicate result emails
    if (quiz.resultsShared) {
      return res.status(400).json({
        success: false,
        message: "Results have already been shared",
      });
    }

    // Get all submitted attempts
    const attempts = await QuizAttempt.find({
      quiz: quiz._id,
      status: "submitted",
    }).populate("student", "name email");

    if (!attempts.length) {
      return res.status(400).json({
        success: false,
        message: "No student results available",
      });
    }

    let sent = 0;
    let failed = 0;

    for (const attempt of attempts) {
      // Student must have an email address
      if (!attempt.student?.email) {
        failed++;
        continue;
      }

      try {
        await sendQuizResultEmail({
          email: attempt.student.email,
          studentName: attempt.student.name,
          quizTitle: quiz.title,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          percentage: attempt.percentage,
        });

        sent++;
      } catch (error) {
        console.error(
          `Failed to send result email to ${attempt.student.email}:`,
          error
        );

        failed++;
      }
    }

    /*
     * Mark results as shared only when at least
     * one result email was successfully sent.
     */
    if (sent > 0) {
      quiz.resultsShared = true;
      quiz.resultsSharedAt = new Date();

      await quiz.save();
    }

    return res.status(200).json({
      success: true,
      message:
        sent > 0
          ? "Quiz results shared successfully"
          : "No result emails were sent",
      sent,
      failed,
      resultsShared: sent > 0,
    });
  } catch (error) {
    console.error("Share quiz results error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailableQuizzes = async (req, res) => {
  try {
    const now = new Date();

    const quizzes = await Quiz.find({
      status: "published",
      $or: [
        {
          "settings.quizMode": "practice",
        },
        {
          "settings.quizMode": "test",
          endTime: {
            $gt: now,
          },
        },
      ],
    })
      .select(
        "title description questions settings startTime endTime status"
      )
      .sort({ createdAt: -1 })
      .lean();

    const safeQuizzes = quizzes.map((quiz) => ({
      ...quiz,

      questions: quiz.questions.map(
        (question) => ({
          _id: question._id,
          question: question.question,
          options: question.options,
          points: question.points,
        })
      ),
    }));

    return res.status(200).json({
      success: true,
      quizzes: safeQuizzes,
    });
  } catch (error) {
    console.error(
      "Get available quizzes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};