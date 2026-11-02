import Quiz from "../models/Quiz.js";
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

const autoSubmitAttempt = async (attempt, quiz, now) => {
  const result = calculateQuizScore(
    quiz,
    (attempt.answers || []).map((answer) => ({
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
    }))
  );

  const deadline = getAttemptDeadline(attempt, quiz);

  attempt.answers = result.answers;
  attempt.score = result.score;
  attempt.totalPoints = result.totalPoints;
  attempt.percentage = result.percentage;
  attempt.submittedAt = now;
  attempt.timeTaken = Math.max(
    0,
    Math.floor(
      ((deadline || now).getTime() - new Date(attempt.startedAt).getTime()) /
        1000
    )
  );
  attempt.submissionType = "automatic";
  attempt.status = "submitted";

  await attempt.save();
};

export const autoSubmitExpiredAttempts = async () => {
  try {
    const now = new Date();

    // Submit attempts whose personal time limit or test end time has expired.
    const attempts = await QuizAttempt.find({
      status: "in-progress",
    }).populate("quiz");

    for (const attempt of attempts) {
      const quiz = attempt.quiz;
      if (!quiz) continue;

      const deadline = getAttemptDeadline(attempt, quiz);
      if (!deadline || now < deadline) continue;

      await autoSubmitAttempt(attempt, quiz, now);

      console.log(
        `Auto-submitted expired attempt ${attempt._id} for quiz ${quiz._id}`
      );
    }

    // A scheduled test is completed only after its configured end time.
    // This also closes the test when nobody is currently taking it.
    const completed = await Quiz.updateMany(
      {
        status: "published",
        "settings.quizMode": "test",
        endTime: { $ne: null, $lte: now },
      },
      {
        $set: { status: "completed" },
      }
    );

    if (completed.modifiedCount > 0) {
      console.log(`Automatically completed ${completed.modifiedCount} scheduled test(s)`);
    }
  } catch (error) {
    console.error("Quiz auto-submit/completion job error:", error);
  }
};
