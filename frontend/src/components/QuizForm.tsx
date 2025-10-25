import React, { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import "../../styles/QuizForm.css";

// ✅ Define types for your quiz data
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type UserAnswers = Record<number, string>;

const QuizForm: React.FC = () => {
  const [topic, setTopic] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ✅ Handle quiz generation
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    setLoading(true);
    setSubmitted(false);

    try {
      const response = await fetch(`${apiUrl}/userQuestionQuiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (Array.isArray(data.quiz)) {
        setQuiz(data.quiz);
      } else {
        alert("Invalid quiz format received from server.");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error fetching quiz:", err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle selecting an answer
  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  // ✅ Handle quiz submission
  const handleQuizSubmit = () => {
    setSubmitted(true);
  };

  // ✅ Calculate score
  const score = quiz.reduce((acc, q, i) => {
    if (userAnswers[i] === q.correctAnswer) acc++;
    return acc;
  }, 0);

  return (
    <div className="quiz-container">
      <h2>AI Quiz Generator</h2>

      {/* Form for topic input */}
      <form onSubmit={handleSubmit} className="quiz-form">
        <input
          type="text"
          placeholder="Enter a topic (e.g., recursion, Newton's Laws)"
          value={topic}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTopic(e.target.value)
          }
          className="quiz-input"
        />
        <button type="submit" disabled={loading} className="quiz-button">
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </form>

      {/* Quiz display */}
      {!submitted && quiz.length > 0 && (
        <div className="quiz-section">
          {quiz.map((q, index) => (
            <div key={index} className="quiz-question">
              <h3>
                {index + 1}. {q.question}
              </h3>
              <div className="quiz-options">
                {q.options.map((opt, i) => (
                  <label key={i} className="quiz-option">
                    <input
                      type="radio"
                      name={`q${index}`}
                      value={opt}
                      checked={userAnswers[index] === opt}
                      onChange={() => handleAnswerSelect(index, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleQuizSubmit} className="submit-button">
            Submit Answers
          </button>
        </div>
      )}

      {/* Results display */}
      {submitted && (
        <div className="results-section">
          <h3>
            You scored {score} / {quiz.length}
          </h3>

          <div className="results-list">
            {quiz.map((q, i) => (
              <div key={i} className="result-item">
                <p>
                  <strong>Q{i + 1}:</strong> {q.question}
                </p>
                <p>
                  <strong>Your answer:</strong> {userAnswers[i] || "No answer"}
                </p>
                <p>
                  <strong>Correct answer:</strong> {q.correctAnswer}
                </p>
                <p className="explanation">{q.explanation}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setQuiz([]);
              setUserAnswers({});
              setSubmitted(false);
              setTopic("");
            }}
            className="reset-button"
          >
            Try Another Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizForm;
