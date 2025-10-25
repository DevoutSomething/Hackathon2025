import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/TextSubmit.css";

export default function TextSubmit() {
  const [userPrompt, setUserPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    console.log("User Prompt:", userPrompt);

    fetch(apiUrl + "/userQuestionText", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setIsLoading(false);  
      navigate("/result", { state: { apiResponse: data } }); 
    })
    .catch(error => {
      console.error("Error:", error);
      navigate("/result", { state: { apiResponse: "test response" } }); 
      setIsLoading(false);
    });
  };

  return (
    <div>
      <form className="form-container" onSubmit={handleSubmit}>
        <input
          className="user-input"
          type="text"
          placeholder="Enter your question"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
        <button 
          className={`submit-button ${isLoading ? 'loading' : ''}`} 
          type="submit" 
          disabled={isLoading || !userPrompt.trim()}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
