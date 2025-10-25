import React, { useState } from "react";
 
import "../../styles/QuizForm.css";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type UserAnswers = Record<number, string>;

export interface QuizFormProps {
  prompt?: string;
  quiz: QuizQuestion[];
  loading: boolean;
  onGenerate: () => void | Promise<void>;
}

const QuizForm: React.FC<QuizFormProps> = ({ prompt: initialPrompt = "", quiz, loading, onGenerate }) => {
  const [prompt] = useState<string>(initialPrompt);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleQuizSubmit = () => {
    setSubmitted(true);
  };

  const score = quiz.reduce((acc, q, i) => {
    if (userAnswers[i] === q.correctAnswer) acc++;
    return acc;
  }, 0);

  return (
    <div className="quiz-container">
      <h2>AI Quiz Generator</h2>

      {loading && <p className="loading-text">Generating quiz...</p>}
      {!loading && !prompt && (
        <p className="loading-text">No prompt provided to generate a quiz.</p>
      )}

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
              setUserAnswers({});
              setSubmitted(false);
              onGenerate();
            }}
            className="reset-button"
          >
            Regenerate Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizForm;