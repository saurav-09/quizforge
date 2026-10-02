import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { calculateQuizScore } from "../utils/quizScoring.js";

/*
|--------------------------------------------------------------------------
| Helper: Get attempt deadline
|--------------------------------------------------------------------------
|
| Deadline is the earliest of:
|
| 1. Attempt startedAt + quiz time limit
| 2. Quiz endTime
|
*/

const getAttemptDeadline = (attempt, quiz) => {
  const deadlines = [];

  /*
   * Quiz time limit
   */
  if (quiz.settings?.timeLimit) {
    const timeLimitMs =
      quiz.settings.timeLimit * 60 * 1000;

    deadlines.push(
      new Date(
        new Date(attempt.startedAt).getTime() +
          timeLimitMs
      )
    );
  }

  /*
   * Quiz scheduled end time
   */
  if (quiz.endTime) {
    deadlines.push(
      new Date(quiz.endTime)
    );
  }

  /*
   * If no deadline exists, return null.
   */
  if (deadlines.length === 0) {
    return null;
  }

  /*
   * Return earliest deadline.
   */
  return new Date(
    Math.min(
      ...deadlines.map((date) =>
        date.getTime()
      )
    )
  );
};

/*
|--------------------------------------------------------------------------
| Helper: Check whether attempt has expired
|--------------------------------------------------------------------------
*/

const isAttemptExpired = (
  attempt,
  quiz
) => {
  const deadline =
    getAttemptDeadline(
      attempt,
      quiz
    );

  if (!deadline) {
    return false;
  }

  return (
    Date.now() >=
    deadline.getTime()
  );
};

/*
|--------------------------------------------------------------------------
| Helper: Remove sensitive question data
|--------------------------------------------------------------------------
|
| Students must NOT receive:
|
| - correctAnswer
| - explanation
|
*/

const getSafeQuestions = (
  questions = []
) => {
  return questions.map(
    (question) => ({
      _id: question._id,
      question: question.question,
      options: question.options,
      points: question.points,
    })
  );
};

/*
|--------------------------------------------------------------------------
| Helper: Build safe quiz for student
|--------------------------------------------------------------------------
*/

const buildSafeQuiz = (quiz) => {
  return {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    questions:
      getSafeQuestions(
        quiz.questions
      ),
    settings: quiz.settings,
    startTime: quiz.startTime,
    endTime: quiz.endTime,
    status: quiz.status,
  };
};

/*
|--------------------------------------------------------------------------
| Helper: Convert stored answers into frontend object
|--------------------------------------------------------------------------
|
| Frontend expects:
|
| {
|   questionId: "selected option"
| }
|
*/

const buildAnswerObject = (
  answers = []
) => {
  const answerObject = {};

  answers.forEach((answer) => {
    if (
      answer.questionId &&
      answer.selectedAnswer !== null &&
      answer.selectedAnswer !== undefined
    ) {
      answerObject[
        answer.questionId.toString()
      ] = answer.selectedAnswer;
    }
  });

  return answerObject;
};

/*
|--------------------------------------------------------------------------
| Helper: Convert attempt answers into submission format
|--------------------------------------------------------------------------
*/

const buildSubmissionAnswers = (
  answers = []
) => {
  return answers.map(
    (answer) => ({
      questionId:
        answer.questionId,
      selectedAnswer:
        answer.selectedAnswer,
    })
  );
};

/*
|--------------------------------------------------------------------------
| Helper: Automatically submit expired attempt
|--------------------------------------------------------------------------
*/

const autoSubmitAttempt = async (
  attempt,
  quiz
) => {
  /*
   * If already submitted, nothing to do.
   */
  if (
    attempt.status === "submitted"
  ) {
    return attempt;
  }

  const submissionAnswers =
    buildSubmissionAnswers(
      attempt.answers
    );

  const scoreResult =
    calculateQuizScore(
      quiz,
      submissionAnswers
    );

  const submittedAt = new Date();

  const startedAt =
    new Date(attempt.startedAt);

  const deadline =
    getAttemptDeadline(
      attempt,
      quiz
    );

  /*
   * Time taken should not exceed the
   * actual allowed quiz duration.
   */
  let timeTaken = Math.floor(
    (submittedAt.getTime() -
      startedAt.getTime()) /
      1000
  );

  if (deadline) {
    const maxTimeTaken = Math.max(
      0,
      Math.floor(
        (deadline.getTime() -
          startedAt.getTime()) /
          1000
      )
    );

    timeTaken = Math.min(
      timeTaken,
      maxTimeTaken
    );
  }

  /*
   * Update attempt.
   */
  attempt.answers =
    scoreResult.answers;

  attempt.score =
    scoreResult.score;

  attempt.totalPoints =
    scoreResult.totalPoints;

  attempt.percentage =
    scoreResult.percentage;

  attempt.submittedAt =
    submittedAt;

  attempt.timeTaken =
    timeTaken;

  attempt.submissionType =
    "automatic";

  attempt.status =
    "submitted";

  await attempt.save();

  return attempt;
};

/*
|--------------------------------------------------------------------------
| START QUIZ
|--------------------------------------------------------------------------
|
| POST /api/quiz-attempts/:quizId/start
|
*/

export const startQuiz = async (
  req,
  res
) => {
  try {
    const { quizId } =
      req.params;

    const studentId =
      req.user._id;

    /*
     * Find quiz.
     */
    const quiz =
      await Quiz.findById(
        quizId
      );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    /*
     * Quiz must be published.
     */
    if (
      quiz.status !== "published"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This quiz is not available",
      });
    }

    /*
     * Check scheduled start time.
     */
    if (
      quiz.startTime &&
      new Date() <
        new Date(quiz.startTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This quiz has not started yet",
      });
    }

    /*
     * Check scheduled end time.
     */
    if (
      quiz.endTime &&
      new Date() >=
        new Date(quiz.endTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This quiz has already ended",
      });
    }

    /*
     * -------------------------------------------------------
     * IMPORTANT:
     * Check for an existing in-progress attempt.
     *
     * This prevents duplicate attempts when the student
     * refreshes or accidentally starts the quiz again.
     * -------------------------------------------------------
     */

    let attempt =
      await QuizAttempt.findOne({
        quiz: quizId,
        student: studentId,
        status: "in-progress",
      }).sort({
        createdAt: -1,
      });

    /*
     * If existing attempt has expired,
     * automatically submit it first.
     */
    if (
      attempt &&
      isAttemptExpired(
        attempt,
        quiz
      )
    ) {
      attempt =
        await autoSubmitAttempt(
          attempt,
          quiz
        );

      /*
       * Since this attempt has now been submitted,
       * don't create another attempt unless the
       * quiz allows another attempt.
       *
       * Continue below to check attempts.
       */
      attempt = null;
    }

    /*
     * -------------------------------------------------------
     * Resume existing active attempt
     * -------------------------------------------------------
     */

    if (attempt) {
      const deadline =
        getAttemptDeadline(
          attempt,
          quiz
        );

      return res.status(200).json({
        success: true,
        message:
          "Existing quiz attempt resumed",
        attemptId:
          attempt._id,
        startedAt:
          attempt.startedAt,
        deadline,
        status:
          attempt.status,
        answers:
          buildAnswerObject(
            attempt.answers
          ),
        quiz:
          buildSafeQuiz(quiz),
      });
    }

    /*
     * -------------------------------------------------------
     * Check attempt limit
     * -------------------------------------------------------
     */

    const maxAttempts =
      quiz.settings?.attempts || 1;

    const attemptCount =
      await QuizAttempt.countDocuments({
        quiz: quizId,
        student: studentId,
        status: "submitted",
      });

    if (
      attemptCount >=
      maxAttempts
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You have used all allowed attempts for this quiz",
      });
    }

    /*
     * -------------------------------------------------------
     * Create new attempt
     * -------------------------------------------------------
     */

    attempt =
      await QuizAttempt.create({
        quiz: quizId,
        student: studentId,
        answers: [],
        startedAt: new Date(),
        status: "in-progress",
      });

    const deadline =
      getAttemptDeadline(
        attempt,
        quiz
      );

    return res.status(201).json({
      success: true,
      message:
        "Quiz started successfully",
      attemptId:
        attempt._id,
      startedAt:
        attempt.startedAt,
      deadline,
      status:
        attempt.status,
      answers: {},
      quiz:
        buildSafeQuiz(quiz),
    });
  } catch (error) {
    console.error(
      "Start quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start quiz",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET QUIZ ATTEMPT
|--------------------------------------------------------------------------
|
| GET /api/quiz-attempts/:attemptId
|
| Used when:
|
| - Student refreshes the page
| - Browser navigation restores the page
| - Router state is lost
|
*/

export const getQuizAttempt = async (
  req,
  res
) => {
  try {
    const { attemptId } =
      req.params;

    const studentId =
      req.user._id;

    /*
     * Find attempt.
     */
    const attempt =
      await QuizAttempt.findOne({
        _id: attemptId,
        student: studentId,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Quiz attempt not found",
      });
    }

    /*
     * Find quiz.
     */
    const quiz =
      await Quiz.findById(
        attempt.quiz
      );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message:
          "Quiz not found",
      });
    }

    /*
     * -------------------------------------------------------
     * If attempt is still active but expired,
     * automatically submit it.
     * -------------------------------------------------------
     */

    if (
      attempt.status ===
        "in-progress" &&
      isAttemptExpired(
        attempt,
        quiz
      )
    ) {
      await autoSubmitAttempt(
        attempt,
        quiz
      );
    }

    /*
     * Calculate deadline.
     */
    const deadline =
      getAttemptDeadline(
        attempt,
        quiz
      );

    /*
     * -------------------------------------------------------
     * If submitted, return result information.
     * -------------------------------------------------------
     */

    let result = null;

    if (
      attempt.status ===
      "submitted"
    ) {
      result = {
        score:
          attempt.score,
        totalPoints:
          attempt.totalPoints,
        percentage:
          attempt.percentage,
        timeTaken:
          attempt.timeTaken,
      };
    }

    return res.status(200).json({
      success: true,

      attemptId:
        attempt._id,

      status:
        attempt.status,

      startedAt:
        attempt.startedAt,

      submittedAt:
        attempt.submittedAt,

      deadline,

      submissionType:
        attempt.submissionType,

      answers:
        attempt.answers,

      result,

      quiz:
        buildSafeQuiz(quiz),
    });
  } catch (error) {
    console.error(
      "Get quiz attempt error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load quiz attempt",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SAVE QUIZ PROGRESS
|--------------------------------------------------------------------------
|
| PATCH /api/quiz-attempts/:attemptId/answers
|
*/

export const saveQuizProgress =
  async (req, res) => {
    try {
      const { attemptId } =
        req.params;

      const { answers } =
        req.body;

      const studentId =
        req.user._id;

      /*
       * Validate answers.
       */
      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message:
            "Answers must be an array",
        });
      }

      /*
       * Find attempt.
       */
      const attempt =
        await QuizAttempt.findOne({
          _id: attemptId,
          student: studentId,
        });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message:
            "Quiz attempt not found",
        });
      }

      /*
       * Cannot save submitted attempt.
       */
      if (
        attempt.status ===
        "submitted"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quiz attempt has already been submitted",
        });
      }

      /*
       * Find quiz.
       */
      const quiz =
        await Quiz.findById(
          attempt.quiz
        );

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message:
            "Quiz not found",
        });
      }

      /*
       * -------------------------------------------------------
       * Check deadline.
       * -------------------------------------------------------
       */

      if (
        isAttemptExpired(
          attempt,
          quiz
        )
      ) {
        await autoSubmitAttempt(
          attempt,
          quiz
        );

        return res.status(400).json({
          success: false,
          message:
            "Quiz time has expired",
          expired: true,
        });
      }

      /*
       * -------------------------------------------------------
       * Validate and store answers.
       *
       * We only store:
       *
       * questionId
       * selectedAnswer
       *
       * Correctness is calculated during submission.
       * -------------------------------------------------------
       */

      const validQuestionIds =
        new Set(
          quiz.questions.map(
            (question) =>
              question._id.toString()
          )
        );

      const sanitizedAnswers =
        answers
          .filter(
            (answer) =>
              answer &&
              answer.questionId &&
              validQuestionIds.has(
                answer.questionId.toString()
              )
          )
          .map(
            (answer) => ({
              questionId:
                answer.questionId,
              selectedAnswer:
                answer.selectedAnswer ??
                null,
            })
          );

      attempt.answers =
        sanitizedAnswers;

      await attempt.save();

      return res.status(200).json({
        success: true,
        message:
          "Progress saved successfully",
      });
    } catch (error) {
      console.error(
        "Save quiz progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to save quiz progress",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| SUBMIT QUIZ
|--------------------------------------------------------------------------
|
| POST /api/quiz-attempts/:attemptId/submit
|
*/

export const submitQuiz = async (
  req,
  res
) => {
  try {
    const { attemptId } =
      req.params;

    const {
      answers = [],
    } = req.body;

    const studentId =
      req.user._id;

    /*
     * Find attempt.
     */
    const attempt =
      await QuizAttempt.findOne({
        _id: attemptId,
        student: studentId,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Quiz attempt not found",
      });
    }

    /*
     * Prevent duplicate submission.
     */
    if (
      attempt.status ===
      "submitted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quiz attempt has already been submitted",
      });
    }

    /*
     * Find quiz.
     */
    const quiz =
      await Quiz.findById(
        attempt.quiz
      );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message:
          "Quiz not found",
      });
    }

    /*
     * -------------------------------------------------------
     * Check deadline.
     *
     * If current time is beyond deadline,
     * submission type becomes automatic.
     * -------------------------------------------------------
     */

    const expired =
      isAttemptExpired(
        attempt,
        quiz
      );

    const finalSubmissionType =
      expired
        ? "automatic"
        : "manual";

    /*
     * -------------------------------------------------------
     * Use answers from request.
     *
     * If request doesn't contain answers,
     * use answers already saved in DB.
     * -------------------------------------------------------
     */

    const finalAnswers =
      Array.isArray(answers) &&
      answers.length > 0
        ? answers
        : buildSubmissionAnswers(
            attempt.answers
          );

    /*
     * Validate question IDs.
     */
    const validQuestionIds =
      new Set(
        quiz.questions.map(
          (question) =>
            question._id.toString()
        )
      );

    const sanitizedAnswers =
      finalAnswers
        .filter(
          (answer) =>
            answer &&
            answer.questionId &&
            validQuestionIds.has(
              answer.questionId.toString()
            )
        )
        .map(
          (answer) => ({
            questionId:
              answer.questionId,
            selectedAnswer:
              answer.selectedAnswer ??
              null,
          })
        );

    /*
     * -------------------------------------------------------
     * Calculate score.
     * -------------------------------------------------------
     */

    const scoreResult =
      calculateQuizScore(
        quiz,
        sanitizedAnswers
      );

    const submittedAt =
      new Date();

    const startedAt =
      new Date(attempt.startedAt);

    /*
     * Calculate time taken.
     */
    let timeTaken = Math.floor(
      (submittedAt.getTime() -
        startedAt.getTime()) /
        1000
    );

    /*
     * Don't allow timeTaken to exceed
     * the actual quiz duration.
     */
    const deadline =
      getAttemptDeadline(
        attempt,
        quiz
      );

    if (deadline) {
      const maxTimeTaken =
        Math.max(
          0,
          Math.floor(
            (deadline.getTime() -
              startedAt.getTime()) /
              1000
          )
        );

      timeTaken = Math.min(
        timeTaken,
        maxTimeTaken
      );
    }

    /*
     * -------------------------------------------------------
     * Save final attempt.
     * -------------------------------------------------------
     */

    attempt.answers =
      scoreResult.answers;

    attempt.score =
      scoreResult.score;

    attempt.totalPoints =
      scoreResult.totalPoints;

    attempt.percentage =
      scoreResult.percentage;

    attempt.submittedAt =
      submittedAt;

    attempt.timeTaken =
      timeTaken;

    attempt.submissionType =
      finalSubmissionType;

    attempt.status =
      "submitted";

    await attempt.save();

    /*
     * -------------------------------------------------------
     * Test results should remain hidden until
     * instructor shares them.
     *
     * Practice results are returned immediately.
     * -------------------------------------------------------
     */

    const isTest =
      quiz.settings?.quizMode ===
      "test";

    return res.status(200).json({
      success: true,

      message:
        "Quiz submitted successfully",

      submissionType:
        finalSubmissionType,

      result: isTest
        ? null
        : {
            score:
              attempt.score,

            totalPoints:
              attempt.totalPoints,

            percentage:
              attempt.percentage,

            timeTaken:
              attempt.timeTaken,
          },
    });
  } catch (error) {
    console.error(
      "Submit quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit quiz",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET QUIZ ATTEMPT RESULT
|--------------------------------------------------------------------------
|
| GET /api/quiz-attempts/:attemptId/result
|
| Returns the final result for the logged-in student's own attempt.
|
| Practice:
|   Result is available immediately.
|
| Test:
|   Result is available only after the instructor shares it.
|
*/

export const getQuizAttemptResult = async (
  req,
  res
) => {
  try {
    const { attemptId } = req.params;

    const studentId = req.user._id;

    /*
     * -------------------------------------------------------
     * Find student's own attempt
     * -------------------------------------------------------
     */

    const attempt =
      await QuizAttempt.findOne({
        _id: attemptId,
        student: studentId,
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    /*
     * -------------------------------------------------------
     * Result is only available after submission.
     * -------------------------------------------------------
     */

    if (attempt.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message:
          "This quiz attempt has not been submitted yet",
      });
    }

    /*
     * -------------------------------------------------------
     * Find quiz
     * -------------------------------------------------------
     */

    const quiz =
      await Quiz.findById(attempt.quiz).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    /*
     * -------------------------------------------------------
     * Determine quiz mode
     * -------------------------------------------------------
     */

    const isTest =
      quiz.settings?.quizMode === "test";

    /*
     * -------------------------------------------------------
     * TEST RESULT SECURITY
     *
     * Test results remain hidden until the instructor
     * shares them.
     * -------------------------------------------------------
     */

    if (
      isTest &&
      quiz.resultsShared !== true
    ) {
      return res.status(200).json({
        success: true,
        resultAvailable: false,
        message:
          "Your result has not been released yet.",
      });
    }

    /*
     * -------------------------------------------------------
     * Create a map of submitted answers
     * -------------------------------------------------------
     */

    const answerMap = new Map();

    for (const answer of attempt.answers || []) {
      answerMap.set(
        answer.questionId.toString(),
        answer
      );
    }

    /*
     * -------------------------------------------------------
     * Build detailed question results
     *
     * At this point the result is allowed to be viewed,
     * so correctAnswer and explanation can be returned.
     * -------------------------------------------------------
     */

    const questions =
      quiz.questions.map(
        (question) => {
          const questionId =
            question._id.toString();

          const studentAnswer =
            answerMap.get(questionId);

          return {
            questionId:
              question._id,

            question:
              question.question,

            options:
              question.options,

            selectedAnswer:
              studentAnswer?.selectedAnswer ??
              null,

            correctAnswer:
              question.correctAnswer,

            isCorrect:
              studentAnswer?.isCorrect ??
              false,

            points:
              question.points,

            pointsEarned:
              studentAnswer?.pointsEarned ??
              0,

            explanation:
              question.explanation || "",
          };
        }
      );

    /*
     * -------------------------------------------------------
     * Return complete result
     * -------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      resultAvailable: true,

      result: {
        attemptId:
          attempt._id,

        quiz: {
          _id: quiz._id,

          title:
            quiz.title,

          description:
            quiz.description,

          settings:
            quiz.settings,
        },

        score:
          attempt.score,

        totalPoints:
          attempt.totalPoints,

        percentage:
          attempt.percentage,

        timeTaken:
          attempt.timeTaken,

        startedAt:
          attempt.startedAt,

        submittedAt:
          attempt.submittedAt,

        submissionType:
          attempt.submissionType,

        questions,
      },
    });
  } catch (error) {
    console.error(
      "Get quiz attempt result error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load quiz result",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY QUIZ ATTEMPTS
|--------------------------------------------------------------------------
|
| GET /api/quiz-attempts/my
|
| Returns all submitted quiz attempts belonging
| to the currently logged-in student.
|
*/

export const getMyQuizAttempts = async (
  req,
  res
) => {
  try {
    const studentId = req.user._id;

    /*
     * Get all submitted attempts for this student.
     */
    const attempts =
      await QuizAttempt.find({
        student: studentId,
        status: "submitted",
      })
        .populate({
          path: "quiz",
          select:
            "title description settings quizMode resultsShared",
        })
        .sort({
          submittedAt: -1,
        })
        .lean();

    /*
     * Build a safe response for the frontend.
     */
    const results = attempts.map(
      (attempt) => {
        const quiz = attempt.quiz;

        /*
         * If quiz was deleted for some reason,
         * don't break the complete results list.
         */
        if (!quiz) {
          return {
            attemptId:
              attempt._id,

            quiz: {
              title: "Quiz unavailable",
            },

            score:
              attempt.score,

            totalPoints:
              attempt.totalPoints,

            percentage:
              attempt.percentage,

            timeTaken:
              attempt.timeTaken,

            submittedAt:
              attempt.submittedAt,

            submissionType:
              attempt.submissionType,

            resultAvailable: false,
          };
        }

        const isTest =
          quiz.settings?.quizMode ===
          "test";

        /*
         * Practice results are always available.
         *
         * Test results are available only when
         * instructor has shared them.
         */
        const resultAvailable =
          !isTest ||
          quiz.resultsShared === true;

        return {
          attemptId:
            attempt._id,

          quiz: {
            _id: quiz._id,

            title:
              quiz.title,

            description:
              quiz.description,

            quizMode:
              quiz.settings?.quizMode ||
              "practice",
          },

          score:
            resultAvailable
              ? attempt.score
              : null,

          totalPoints:
            resultAvailable
              ? attempt.totalPoints
              : null,

          percentage:
            resultAvailable
              ? attempt.percentage
              : null,

          timeTaken:
            resultAvailable
              ? attempt.timeTaken
              : null,

          submittedAt:
            attempt.submittedAt,

          submissionType:
            attempt.submissionType,

          resultAvailable,
        };
      }
    );

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(
      "Get my quiz attempts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load quiz results",
    });
  }
};