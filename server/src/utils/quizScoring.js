export const calculateQuizScore = (quiz, submittedAnswers) => {
  let score = 0;
  let totalPoints = 0;

  const answers = quiz.questions.map((question) => {
    const submitted = submittedAnswers.find(
      (answer) =>
        answer.questionId.toString() === question._id.toString()
    );

    const selectedAnswer = submitted?.selectedAnswer || null;

    const isCorrect =
      selectedAnswer !== null &&
      selectedAnswer === question.correctAnswer;

    const pointsEarned = isCorrect ? question.points : 0;

    totalPoints += question.points;
    score += pointsEarned;

    return {
      questionId: question._id,
      selectedAnswer,
      isCorrect,
      pointsEarned,
    };
  });

  const percentage =
    totalPoints > 0
      ? Number(((score / totalPoints) * 100).toFixed(2))
      : 0;

  return {
    answers,
    score,
    totalPoints,
    percentage,
  };
};