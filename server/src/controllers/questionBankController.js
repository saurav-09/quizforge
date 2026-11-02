import QuestionBankItem from "../models/QuestionBankItem.js";

const validateQuestion = (body) => {
  const question = body.question?.trim();
  const options = Array.isArray(body.options) ? body.options.map((item) => String(item).trim()) : [];
  const correctAnswer = body.correctAnswer?.trim();
  if (!question || options.length < 2 || options.some((item) => !item) || !correctAnswer || !options.includes(correctAnswer)) {
    return { error: "Add question text, at least two options, and a correct answer that matches an option." };
  }
  if (!body.topic?.trim()) return { error: "A topic is required for performance analytics." };
  const points = Number(body.points ?? 1);
  if (!Number.isInteger(points) || points < 1) return { error: "Points must be a positive whole number." };
  return { value: { question, questionType: "mcq", options, correctAnswer, explanation: body.explanation?.trim() || "", topic: body.topic.trim(), subtopic: body.subtopic?.trim() || "", difficulty: ["easy", "medium", "hard"].includes(body.difficulty) ? body.difficulty : "medium", points } };
};

export const listQuestionBank = async (req, res) => {
  try {
    const filter = { instructor: req.user._id };
    if (req.query.topic) filter.topic = String(req.query.topic).trim();
    if (req.query.difficulty && ["easy", "medium", "hard"].includes(req.query.difficulty)) filter.difficulty = req.query.difficulty;
    if (req.query.search) filter.$text = { $search: String(req.query.search).slice(0, 100) };
    const questions = await QuestionBankItem.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
    return res.json({ success: true, questions });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load question bank" });
  }
};

export const createQuestionBankItem = async (req, res) => {
  const validation = validateQuestion(req.body);
  if (validation.error) return res.status(400).json({ success: false, message: validation.error });
  try {
    const question = await QuestionBankItem.create({ ...validation.value, instructor: req.user._id });
    return res.status(201).json({ success: true, question });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to save question" });
  }
};

export const updateQuestionBankItem = async (req, res) => {
  const validation = validateQuestion(req.body);
  if (validation.error) return res.status(400).json({ success: false, message: validation.error });
  try {
    const question = await QuestionBankItem.findOneAndUpdate(
      { _id: req.params.questionId, instructor: req.user._id },
      { $set: validation.value },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });
    return res.json({ success: true, question });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update question" });
  }
};

export const deleteQuestionBankItem = async (req, res) => {
  try {
    const question = await QuestionBankItem.findOneAndDelete({ _id: req.params.questionId, instructor: req.user._id });
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });
    return res.json({ success: true, message: "Question deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to delete question" });
  }
};
