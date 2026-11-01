export const calculateQuizScore = (quiz, submittedAnswers) => {
  let score = 0;
  let totalPoints = 0;
  const settings = quiz.settings || {};
  const penalty = settings.negativeMarkingEnabled
    ? Math.max(0, Number(settings.negativeMarkingPoints) || 0)
    : 0;

  const answers = quiz.questions.map((question) => {
    const submitted = submittedAnswers.find(
      (answer) => answer.questionId.toString() === question._id.toString()
    );
    const selectedAnswer = submitted?.selectedAnswer || null;
    const isCorrect = selectedAnswer !== null && selectedAnswer === question.correctAnswer;
    const pointsEarned = isCorrect
      ? Number(question.points) || 0
      : selectedAnswer !== null && penalty > 0
        ? -penalty
        : 0;

    totalPoints += Number(question.points) || 0;
    score += pointsEarned;

    return { questionId: question._id, selectedAnswer, isCorrect, pointsEarned };
  });

  // Keep the final score non-negative even when penalties exceed earned marks.
  score = Math.max(0, score);
  const percentage = totalPoints > 0
    ? Number(((score / totalPoints) * 100).toFixed(2))
    : 0;

  return { answers, score, totalPoints, percentage };
};
