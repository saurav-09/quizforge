import QuizAttempt from "../models/QuizAttempt.js";
import { calculateQuizScore } from "./quizScoring.js";

export const autoSubmitExpiredAttempts = async () => {
  try {
    const now = new Date();

    const attempts = await QuizAttempt.find({
      status: "in-progress",
    }).populate("quiz");

    for (const attempt of attempts) {
      const quiz = attempt.quiz;

      if (!quiz || !quiz.endTime || now < quiz.endTime) {
        continue;
      }

      const result = calculateQuizScore(
        quiz,
        attempt.answers.map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
        }))
      );

      attempt.answers = result.answers;
      attempt.score = result.score;
      attempt.totalPoints = result.totalPoints;
      attempt.percentage = result.percentage;
      attempt.submittedAt = now;
      attempt.timeTaken = Math.floor(
        (quiz.endTime - attempt.startedAt) / 1000
      );
      attempt.submissionType = "automatic";
      attempt.status = "submitted";

      await attempt.save();

      console.log(
        `Auto-submitted attempt ${attempt._id} for quiz ${quiz._id}`
      );
    }
  } catch (error) {
    console.error("Auto-submit expired attempts error:", error);
  }
};