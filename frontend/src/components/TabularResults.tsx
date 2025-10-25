import { useEffect, useRef, useState } from "react";
import TextResult from "./TextResult";
import "../../styles/TabularResults.css";
import QuizForm from "./QuizForm";

interface ApiResponse {
  promptReceived: string;
  response: string;
  success: boolean;
}

interface TabularResultsProps {
  apiResponse: ApiResponse | string;
  type?: "text" | "video" | "quiz";
}

type TabType = "text" | "video" | "quiz";

export default function TabularResults({ apiResponse, type = "text" }: TabularResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>(type);

  // Extract prompt for display
  const prompt = typeof apiResponse === "string" 
    ? "Your Question" 
    : apiResponse.promptReceived || "Your Question";

  // Quiz state stored at parent so it persists across tab switches
  interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const latestRequestId = useRef<number>(0);
  const isMounted = useRef<boolean>(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const generateQuiz = async () => {
    if (!prompt || !prompt.trim()) return;
    // Clear any previously saved quiz so we don't reuse it on regenerate
    if (isMounted.current) setQuiz([]);
    if (isMounted.current) setQuizLoading(true);
    const requestId = Date.now();
    latestRequestId.current = requestId;
    try {
      const response = await fetch(`${apiUrl}/userQuestionQuiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate quiz");
      }
      if (Array.isArray(data.quiz)) {
        // Ignore stale responses and avoid state updates after unmount
        if (isMounted.current && latestRequestId.current === requestId) {
          setQuiz(data.quiz);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Only stop loading if this is the latest request and still mounted
      if (isMounted.current && latestRequestId.current === requestId) {
        setQuizLoading(false);
      }
    }
  };

  // Auto-generate once when first visiting the Quiz tab (if empty)
  useEffect(() => {
    if (activeTab === "quiz" && quiz.length === 0 && !quizLoading) {
      generateQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Track mount status so in-flight requests can safely complete
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: "text", label: "Text" },
    { id: "video", label: "Video" },
    { id: "quiz", label: "Quiz" },
  ];

  return (
    <div className="tabular-results-container">
      <div className="tabular-results-header">
        <h2>Results for: {prompt}</h2>
      </div>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tabular-results-content">
        {activeTab === "text" ? (
          <TextResult />
        ) : activeTab === "video" ? (
          <div className="video-result-placeholder">
            <p>Video results coming soon...</p>
            <p>Prompt: {prompt}</p>
          </div>
        ) : activeTab === "quiz" ? (
          <QuizForm
            prompt={prompt}
            quiz={quiz}
            loading={quizLoading}
            onGenerate={generateQuiz}
          />
        ) : null}
      </div>
    </div>
  );
}

