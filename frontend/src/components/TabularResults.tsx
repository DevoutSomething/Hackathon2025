import { useState } from "react";
import TextResult from "./TextResult";
import "../../styles/TabularResults.css";

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
          <div className="quiz-result-placeholder">
            <p>Quiz coming soon...</p>
            <p>Interactive quiz based on: {prompt}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

