import QuizAttempt from "../models/QuizAttempt.js";
import { calculateQuizScore } from "./quizScoring.js";

const getAttemptDeadline = (attempt, quiz) => {
  const deadlines = [];

  if (Number(quiz.settings?.timeLimit) > 0) {
    deadlines.push(
      new Date(
        new Date(attempt.startedAt).getTime() +
          Number(quiz.settings.timeLimit) * 60 * 1000
      )
    );
  }

  if (quiz.endTime) {
    deadlines.push(new Date(quiz.endTime));
  }

  return deadlines.length
    ? new Date(Math.min(...deadlines.map((date) => date.getTime())))
    : null;
};

export const autoSubmitExpiredAttempts = async () => {
  try {
    const now = new Date();

    const attempts = await QuizAttempt.find({
      status: "in-progress",
    }).populate("quiz");

    for (const attempt of attempts) {
      const quiz = attempt.quiz;

      if (!quiz) continue;

      const deadline = getAttemptDeadline(attempt, quiz);

      if (!deadline || now < deadline) continue;

      const result = calculateQuizScore(
        quiz,
        (attempt.answers || []).map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
        }))
      );

      attempt.answers = result.answers;
      attempt.score = result.score;
      attempt.totalPoints = result.totalPoints;
      attempt.percentage = result.percentage;
      attempt.submittedAt = now;
      attempt.timeTaken = Math.max(
        0,
        Math.floor((deadline.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      );
      attempt.submissionType = "automatic";
      attempt.status = "submitted";

      await attempt.save();

      console.log(
        `Auto-submitted expired attempt ${attempt._id} for quiz ${quiz._id}`
      );
    }
  } catch (error) {
    console.error("Auto-submit expired attempts error:", error);
  }
};
