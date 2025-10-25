require("dotenv").config();
const express = require("express");
const https = require("https");
const app = express();
const PORT = 3000;

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

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// Function to call Claude API
async function callClaudeAPI(userPrompt) {
  console.log("Calling Claude API with prompt:", userPrompt);

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are an educational AI assistant built to help students understand and visualize concepts interactively. Your job is to teach, not just tell. You adapt your explanations to the user’s preferred learning style: visual, practical, or auditory. \
When responding: \
- Always simplify complex ideas with examples, analogies, or diagrams (as appropriate to the learning style). \
- For **visual learners**, describe diagrams or sketches that could be drawn on the whiteboard. \
- For **practical learners**, provide example-based reasoning, short exercises, or real-world applications. \
- For **auditory learners**, write naturally spoken-style explanations. \
- When referring to **math expressions**, use LaTeX notation wrapped in double dollar signs (e.g., $$x^2 + y^2 = r^2$$). \
- Be concise, interactive, and encourage the user to experiment or ask follow-ups. \
- When relevant, suggest actions the user can perform on the whiteboard (e.g., 'try sketching a parabola opening upward'). \
- If the user draws or uploads a diagram, interpret it, explain it, or continue it intelligently. \
- Avoid giving direct answers immediately; aim to help the user *understand* through step-by-step reasoning.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          console.log("Claude API Response:", parsedData);

          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Claude API error: ${res.statusCode} - ${
                  parsedData.error?.message || "Unknown error"
                }`
              )
            );
          } else {
            resolve(parsedData.content[0].text);
          }
        } catch (error) {
          reject(
            new Error(`Failed to parse Claude API response: ${error.message}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error calling Claude API:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
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

    if (!CLAUDE_API_KEY) {
      console.log("Error: CLAUDE_API_KEY not configured");
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter((k) => k.includes("CLAUDE"))
      );
      return res.status(500).json({ error: "CLAUDE_API_KEY not configured" });
    }

    console.log("API Key found, calling Claude API...");
    // Call Claude API with the user's prompt
    const claudeResponse = await callClaudeAPI(userPrompt);

    console.log("Successfully got response from Claude");
    res.json({
      promptReceived: userPrompt,
      response: claudeResponse,
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

app.post("/userQuestionQuiz", (req, res) => {
  const prompt = req.body.prompt;

  res.send({
    promptReceived: prompt,
    text: "not implimented yet",
  });
});

app.post("/userQuestionVideo", (req, res) => {
  const prompt = req.body.prompt;

  res.send({
    promptReceived: prompt,
    videoUrl: "not implimented yet",
  });
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
