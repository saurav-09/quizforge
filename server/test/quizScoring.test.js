import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuizScore } from "../src/utils/quizScoring.js";

const quiz = {
  questions: [
    { _id: "q1", correctAnswer: "A", points: 2 },
    { _id: "q2", correctAnswer: "D", points: 1 },
    { _id: "q3", correctAnswer: "B", points: 3 },
  ],
};

test("scores correct answers and calculates percentage", () => {
  const result = calculateQuizScore(quiz, [
    { questionId: "q1", selectedAnswer: "A" },
    { questionId: "q2", selectedAnswer: "D" },
    { questionId: "q3", selectedAnswer: "C" },
  ]);

  assert.equal(result.score, 3);
  assert.equal(result.totalPoints, 6);
  assert.equal(result.percentage, 50);
  assert.deepEqual(
    result.answers.map((answer) => answer.isCorrect),
    [true, true, false]
  );
});

test("treats unanswered questions as incorrect", () => {
  const result = calculateQuizScore(quiz, []);

  assert.equal(result.score, 0);
  assert.equal(result.totalPoints, 6);
  assert.equal(result.percentage, 0);
  assert.deepEqual(
    result.answers.map((answer) => answer.selectedAnswer),
    [null, null, null]
  );
});

test("does not award points for an incorrect answer", () => {
  const result = calculateQuizScore(quiz, [
    { questionId: "q1", selectedAnswer: "B" },
  ]);

  assert.equal(result.answers[0].isCorrect, false);
  assert.equal(result.answers[0].pointsEarned, 0);
  assert.equal(result.score, 0);
});
