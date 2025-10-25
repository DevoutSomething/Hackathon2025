const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("API is up");
});

app.post("/userQuestionText", (req, res) => {
  const prompt = req.body.prompt;

  res.send({
    promptReceived: prompt,
    title: "What is the capital of France?",
    answers: [
      { answer: "Paris", isCorrect: true },
      { answer: "London", isCorrect: false },
      { answer: "Berlin", isCorrect: false },
      { answer: "Madrid", isCorrect: false },
    ],
  });
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
