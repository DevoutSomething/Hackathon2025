import React, { useEffect, useState } from "react";
import { useUserSettings } from "../contexts/UserSettingsContext";
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<Set<string>>(new Set());
  const { settings } = useUserSettings();

  // Reset flow when a new quiz arrives
  useEffect(() => {
    setCurrentIndex(0);
    setHasAnsweredCorrectly(false);
    setSelectedAnswer(null);
    setWrongAttempts(new Set());
    setUserAnswers({});
  }, [quiz]);

  // Select answer with immediate feedback - must get correct to proceed
  const handleAnswerSelect = (answer: string) => {
    if (hasAnsweredCorrectly || !quiz[currentIndex]) return;
    const correct = quiz[currentIndex].correctAnswer === answer;
    setSelectedAnswer(answer);
    
    if (correct) {
      setHasAnsweredCorrectly(true);
      setUserAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
      setWrongAttempts(new Set());
    } else {
      // Mark this answer as wrong, user must try again
      setWrongAttempts((prev) => new Set(prev).add(answer));
    }
  };

  const handleNext = () => {
    if (!hasAnsweredCorrectly) return; // Can't advance without correct answer
    if (currentIndex + 1 < quiz.length) {
      setCurrentIndex((idx) => idx + 1);
      setHasAnsweredCorrectly(false);
      setSelectedAnswer(null);
      setWrongAttempts(new Set());
    } else {
      // Quiz completed - generate a new one
      setUserAnswers({});
      setCurrentIndex(0);
      setHasAnsweredCorrectly(false);
      setSelectedAnswer(null);
      setWrongAttempts(new Set());
      onGenerate();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setHasAnsweredCorrectly(true);
      setSelectedAnswer(userAnswers[prevIndex] || null);
      setWrongAttempts(new Set());
    }
  };

  return (
    <div className="quiz-container">
      <h2>AI Quiz Generator</h2>

      {loading && <p className="loading-text">Generating quiz...</p>}
      {!loading && !prompt && (
        <p className="loading-text">No prompt provided to generate a quiz.</p>
      )}

      {/* One-question-at-a-time with immediate feedback */}
      {quiz.length > 0 && (
        <div className="quiz-section">
          <div className="quiz-progress">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">Question {currentIndex + 1} of {quiz.length}</span>
          </div>

          <div className="quiz-question">
            <h3>
              {quiz[currentIndex].question}
            </h3>
            <div className="quiz-options">
              {quiz[currentIndex].options.map((opt, i) => {
                const isCorrect = hasAnsweredCorrectly && opt === selectedAnswer;
                const isWrong = wrongAttempts.has(opt);
                return (
                  <label
                    key={i}
                    className={`quiz-option${isCorrect ? " option-correct" : ""}${isWrong ? " option-incorrect" : ""}${hasAnsweredCorrectly ? " option-disabled" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q${currentIndex}`}
                      value={opt}
                      checked={selectedAnswer === opt}
                      onChange={() => handleAnswerSelect(opt)}
                      disabled={hasAnsweredCorrectly}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>

            {hasAnsweredCorrectly && (
              <div className="feedback correct">
                <span>✓ Correct!</span>
                <p className="explanation">{quiz[currentIndex].explanation}</p>
              </div>
            )}
            {wrongAttempts.size > 0 && !hasAnsweredCorrectly && (
              <div className="feedback incorrect">
                <span>✗ Try again!</span>
              </div>
            )}

            <div className="quiz-navigation">
              {currentIndex > 0 && (
                <button onClick={handleBack} className="back-button">
                  ← Back
                </button>
              )}
              {hasAnsweredCorrectly && (
                <button onClick={handleNext} className="next-button">
                  {currentIndex + 1 < quiz.length ? "Next Question →" : "Finish & Create New Quiz"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizForm;