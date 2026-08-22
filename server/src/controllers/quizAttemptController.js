import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { calculateQuizScore } from "../utils/quizScoring.js";

export const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (quiz.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Quiz is not available",
      });
    }

    const now = new Date();

    if (quiz.startTime && now < quiz.startTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz has not started yet",
      });
    }

    if (quiz.endTime && now >= quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz time has ended",
      });
    }

    const attemptCount = await QuizAttempt.countDocuments({
  quiz: quiz._id,
  student: req.user._id,
});

if (attemptCount >= quiz.settings.attemptsAllowed) {
  return res.status(400).json({
    success: false,
    message: "You have used all your attempts",
  });
}

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      totalPoints: quiz.questions.reduce(
        (total, question) => total + question.points,
        0
      ),
      startedAt: now,
    });

    const safeQuestions = quiz.questions.map((question) => ({
      _id: question._id,
      question: question.question,
      options: question.options,
      points: question.points,
    }));

    res.status(201).json({
      success: true,
      attemptId: attempt._id,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: safeQuestions,
        settings: quiz.settings,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
      },
    });
  } catch (error) {
    console.error("Start quiz error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers = [] } = req.body;

    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      student: req.user._id,
      status: "in-progress",
    }).populate("quiz");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found",
      });
    }

    const quiz = attempt.quiz;
    const now = new Date();

    const isAutomatic = quiz.endTime && now >= quiz.endTime;

    const result = calculateQuizScore(quiz, answers);

    attempt.answers = result.answers;
    attempt.score = result.score;
    attempt.totalPoints = result.totalPoints;
    attempt.percentage = result.percentage;
    attempt.submittedAt = now;
    attempt.timeTaken = Math.floor(
      (now - attempt.startedAt) / 1000
    );
    attempt.submissionType = isAutomatic ? "automatic" : "manual";
    attempt.status = "submitted";

    await attempt.save();

    res.status(200).json({
      success: true,
      message:
        quiz.settings.quizMode === "test"
          ? "Your test has been submitted."
          : "Quiz submitted successfully.",
      result:
        quiz.settings.quizMode === "test"
          ? null
          : {
              score: attempt.score,
              totalPoints: attempt.totalPoints,
              percentage: attempt.percentage,
              answers: attempt.answers,
            },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveQuizProgress = async (req, res) => {
  try {
    const { answers = [] } = req.body;

    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      student: req.user._id,
      status: "in-progress",
    }).populate("quiz");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active quiz attempt not found",
      });
    }

    const now = new Date();

    if (attempt.quiz.endTime && now >= attempt.quiz.endTime) {
      return res.status(400).json({
        success: false,
        message: "Quiz time has ended",
      });
    }

    attempt.answers = answers.map((answer) => ({
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer || null,
    }));

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz progress saved",
    });
  } catch (error) {
    console.error("Save quiz progress error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};