require("dotenv").config();
const express = require("express");
const { Groq } = require("groq-sdk");
const app = express();
const PORT = 3000;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Function to call Groq API
async function callGroqAPI(userPrompt) {
  console.log("Calling Groq API with prompt:", userPrompt);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an educational AI assistant built to help students understand and visualize concepts interactively. 
Your job is to teach, not just tell. You adapt your explanations to the user's preferred learning style: visual, practical, or auditory.
When responding:
- Simplify complex ideas with examples, analogies, or diagrams.
- For **visual learners**, describe diagrams or sketches for the whiteboard.
- For **practical learners**, give example-based reasoning or real-world exercises.
- For **auditory learners**, explain in spoken-style language.
- Use LaTeX notation wrapped in $$ for math, e.g. $$x^2 + y^2 = r^2$$.
- Be concise, interactive, and encourage experimentation.
- Suggest actions like 'try sketching a parabola opening upward' when appropriate.
- If the user draws something, interpret or explain it.
- Focus on helping the user *understand*, not just giving answers. Dont use bullet points in the explanation, use paragraphs instead. 
- Help the user and dont focus on giving answers, give an explentaion that is easy to follow. dont ask the user any follow up questions
- you should not act as an LLM. Act as a teacher and do not thank or say anything related to the question. Simply give the explenation step by step`
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
      stop: null
    });

    console.log("Groq API Response:", chatCompletion);
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}
async function callGroqAPIWithSystem(userPrompt, systemPrompt) {
  console.log("Calling Groq API with custom system prompt");

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
      stop: null
    });

    console.log("Groq API Response:", chatCompletion);
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

app.get("/", (req, res) => {
  res.send("API is up");
});

app.post("/userQuestionText", async (req, res) => {
  console.log("=== /userQuestionText endpoint called ===");
  console.log("Request body:", req.body);

  try {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      console.log("Error: No prompt provided");
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.log("Error: GROQ_API_KEY not configured");
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter((k) => k.includes("GROQ"))
      );
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    console.log("API Key found, calling Groq API...");
    // Call Groq API with the user's prompt
    const groqResponse = await callGroqAPI(userPrompt);

    console.log("Successfully got response from Groq");
    res.json({
      promptReceived: userPrompt,
      response: groqResponse,
      success: true,
    });
  } catch (error) {
    console.error("Error in /userQuestionText:", error);
    res.status(500).json({
      error: "Failed to get response from Claude API",
      message: error.message,
    });
  }
});

// ...existing code...
app.post("/userQuestionQuiz", async (req, res) => {
  console.log("=== /userQuestionQuiz endpoint called ===");
  console.log("Request body:", req.body);

  try {
    const topic = req.body.topic;

    if (!topic) {
      console.log("Error: No topic provided");
      return res.status(400).json({ error: "Topic is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.log("Error: GROQ_API_KEY not configured");
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    const quizSystemPrompt = `You are a quiz generator. Generate exactly 5 multiple choice questions on the given topic.
Return ONLY valid JSON (no markdown, no code blocks, no extra text) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
    "correctAnswer": "A) First option",
    "explanation": "Brief explanation of why this is correct"
  }
]

Important rules:
- Generate exactly 5 questions
- Each question must have exactly 4 options labeled A), B), C), D)
- correctAnswer must exactly match one of the options (including the letter prefix)
- Keep questions clear and educational
- Provide helpful explanations
- For each question have a very easy question, 2 easy questions 1 medium question and 1 hard question`;

    const quizPrompt = `Generate a quiz on the topic: "${topic}"`;

    console.log("API Key found, calling Groq API for quiz...");
    const groqResponse = await callGroqAPIWithSystem(
      quizPrompt,
      quizSystemPrompt
    );

    // Try to parse the JSON response
    let quiz;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanResponse = groqResponse.trim();

      // Remove markdown code fences
      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      // Extract JSON array - look for the outermost array
      const jsonMatch = cleanResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response
        quiz = JSON.parse(cleanResponse);
      }

      // Validate the quiz structure
      if (!Array.isArray(quiz)) {
        throw new Error("Response is not an array");
      }

      if (quiz.length !== 5) {
        console.warn(`Expected 5 questions, got ${quiz.length}`);
      }

      // Validate each question
      quiz.forEach((q, index) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          !q.correctAnswer ||
          !q.explanation
        ) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        if (q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(
            `Question ${index + 1}: correctAnswer must match one of the options`
          );
        }
      });

      console.log(
        `Successfully parsed and validated quiz with ${quiz.length} questions`
      );
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", parseError);
      console.error("Raw response:", groqResponse);
      return res.status(500).json({
        error: "Failed to parse quiz from Groq",
        details: parseError.message,
        raw: groqResponse.substring(0, 500), // Send first 500 chars for debugging
      });
    }

    res.json({
      topic: topic,
      quiz: quiz,
      success: true,
    });
  } catch (error) {
    console.error("Error in /userQuestionQuiz:", error);
    res.status(500).json({
      error: "Failed to generate quiz",
      message: error.message,
    });
  }
});

app.post("/updateUserSettings", (req, res) => {
  const newSettings = req.body.settings;

  res.send({
    text: "settings have been updated",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
