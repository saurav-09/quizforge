import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { sendQuizResultEmail } from "../utils/emailService.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, settings } = req.body;

    if (settings?.quizMode === "test" && !req.body.startTime) {
  return res.status(400).json({
    success: false,
    message: "Test start time is required",
  });
}

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      });
    }

    if (
      settings?.quizMode &&
      !["practice", "test"].includes(settings.quizMode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz mode",
      });
    }

    let startTime = null;
let endTime = null;

if (settings?.quizMode === "test") {
  startTime = new Date(req.body.startTime);

  if (isNaN(startTime.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid start time",
    });
  }

  endTime = new Date(
    startTime.getTime() + settings.timeLimit * 60 * 1000
  );
}

    const quiz = await Quiz.create({
  title: title.trim(),
  description: description?.trim() || "",
  questions,
  settings,
  startTime,
  endTime,
  creator: req.user._id,
});

    res.status(201).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    res.status(500).json({
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
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid quiz ID",
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

    if (quiz.status === "archived") {
      return res.status(400).json({
        success: false,
        message: "Archived quiz cannot be updated",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "questions",
      "settings",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        quiz[field] = req.body[field];
      }
    });

    await quiz.save();

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    res.status(500).json({
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

    if (!quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: "Add at least one question before publishing",
      });
    }

    quiz.status = "published";

    await quiz.save();

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Publish quiz error:", error);

    res.status(500).json({
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
    });

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
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      quiz: {
  _id: quiz._id,
  title: quiz.title,
  status: quiz.status,
  quizMode: quiz.settings.quizMode,
  resultsShared: quiz.resultsShared,
},
      results: attempts,
    });
  } catch (error) {
    console.error("Get quiz results error:", error);

    res.status(500).json({
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

    if (quiz.settings.quizMode !== "test") {
      return res.status(400).json({
        success: false,
        message: "Results sharing is only available for test quizzes",
      });
    }

    if (quiz.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Complete the test before sharing results",
      });
    }

    if (quiz.resultsShared) {
  return res.status(400).json({
    success: false,
    message: "Results have already been shared",
  });
}

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
      `Failed to send result to ${attempt.student.email}`,
      error
    );

    failed++;
  }
}

if (sent > 0) {
  quiz.resultsShared = true;
  quiz.resultsSharedAt = new Date();

  await quiz.save();
}

res.status(200).json({
  success: true,
  message: "Quiz results shared successfully",
  sent,
  failed,
});
 
  } catch (error) {
    console.error("Share quiz results error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};