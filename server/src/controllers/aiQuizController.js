const parseModelJson = (content) => JSON.parse(content.trim());
const generationRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_GENERATIONS_PER_WINDOW = 10;

export const generateQuizQuestions = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: "AI quiz generation is not configured. Add GEMINI_API_KEY to the server environment.",
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

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const requestOptions = {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You create accurate educational multiple-choice quizzes. Return only a JSON object with a questions array. Each question must have question (string), options (exactly four distinct strings), correctAnswer (exactly one option string), explanation (string), and points (positive integer). Avoid ambiguous questions and ensure the answer is factually correct.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Create exactly ${count} ${difficulty}-difficulty multiple-choice questions about: ${topic.trim()}. Keep questions clear and self-contained. Provide four plausible options and a concise explanation for each correct answer. Return JSON as { "questions": [...] }.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 5000,
          responseMimeType: "application/json",
        },
      }),
    };

    let response;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(requestUrl, {
          ...requestOptions,
          signal: AbortSignal.timeout(120000),
        });

        if (response.status !== 503 || attempt === 1) {
          break;
        }

        console.warn("Gemini is temporarily overloaded. Retrying once...");
      } catch (error) {
        const isTimeout = error.name === "TimeoutError" || error.name === "AbortError";
        if (!isTimeout || attempt === 1) {
          throw error;
        }

        console.warn("Gemini request timed out. Retrying once...");
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const payload = await response.json();

    if (!response.ok) {
      console.error("Gemini quiz generation error:", payload.error?.message || response.statusText);
      return res.status(502).json({
        success: false,
        message: "The AI provider could not generate questions right now. Please try again.",
      });
    }

    const content = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!content) {
      console.error(
        "Gemini returned no text:",
        payload.promptFeedback?.blockReason || payload.candidates?.[0]?.finishReason || "No response content"
      );
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
