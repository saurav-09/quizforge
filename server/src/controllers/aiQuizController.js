const parseModelJson = (content) => JSON.parse(content.trim());
const generationRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_GENERATIONS_PER_WINDOW = 10;

export const generateQuizQuestions = async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: "AI quiz generation is not configured. Add OPENAI_API_KEY to the server environment.",
      });
    }

    const { topic, questionCount = 5, difficulty = "medium" } = req.body || {};
    const count = Number(questionCount);

    if (typeof topic !== "string" || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Enter a topic with at least 3 characters.",
      });
    }

    if (topic.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: "Topic must be 300 characters or fewer.",
      });
    }

    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 1 and 20.",
      });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Choose easy, medium, or hard difficulty.",
      });
    }

    const now = Date.now();
    const userId = req.user._id.toString();
    const recentRequests = (generationRequests.get(userId) || []).filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    if (recentRequests.length >= MAX_GENERATIONS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        message: "AI generation limit reached. Please try again in 15 minutes.",
      });
    }

    recentRequests.push(now);
    generationRequests.set(userId, recentRequests);

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      signal: AbortSignal.timeout(45000),
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_completion_tokens: 5000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You create accurate educational multiple-choice quizzes. Return only a JSON object with a questions array. Each question must have question (string), options (exactly four distinct strings), correctAnswer (exactly one option string), explanation (string), and points (positive integer). Avoid ambiguous questions and ensure the answer is factually correct.",
          },
          {
            role: "user",
            content: `Create exactly ${count} ${difficulty}-difficulty multiple-choice questions about: ${topic.trim()}. Keep questions clear and self-contained. Provide four plausible options and a concise explanation for each correct answer. Return JSON as { "questions": [...] }.`,
          },
        ],
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error("OpenAI quiz generation error:", payload.error?.message || response.statusText);
      return res.status(502).json({
        success: false,
        message: "The AI provider could not generate questions right now. Please try again.",
      });
    }

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        success: false,
        message: "The AI provider returned an empty response.",
      });
    }

    const parsed = parseModelJson(content);
    const rawQuestions = parsed.questions;

    if (!Array.isArray(rawQuestions) || rawQuestions.length !== count) {
      return res.status(502).json({
        success: false,
        message: "The AI response did not contain the requested number of questions. Please try again.",
      });
    }

    const questions = rawQuestions.map((item) => {
      const options = Array.isArray(item.options)
        ? item.options.map((option) => String(option).trim())
        : [];
      const question = String(item.question || "").trim();
      const correctAnswer = String(item.correctAnswer || "").trim();

      if (
        !question ||
        options.length !== 4 ||
        options.some((option) => !option) ||
        new Set(options).size !== 4 ||
        !options.includes(correctAnswer)
      ) {
        throw new Error("The AI returned an invalid question.");
      }

      return {
        question,
        options,
        correctAnswer,
        explanation: String(item.explanation || "").trim(),
        points: Math.max(1, Math.min(10, Math.round(Number(item.points) || 1))),
      };
    });

    return res.status(200).json({
      success: true,
      questions,
      model,
    });
  } catch (error) {
    console.error("Generate quiz questions error:", error);
    return res.status(502).json({
      success: false,
      message: error.message === "The AI returned an invalid question."
        ? error.message
        : "Failed to generate quiz questions. Please try again.",
    });
  }
};
