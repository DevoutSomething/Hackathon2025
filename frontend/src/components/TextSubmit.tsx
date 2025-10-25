import React from "react";

export default function TextSubmit() {
  const [userPrompt, setUserPrompt] = React.useState("");

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("API URL from import.meta.env:", apiUrl);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("User Prompt:", userPrompt);
    console.log("Will send to API:", apiUrl);
    fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ prompt: userPrompt }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error:", error));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your question"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
