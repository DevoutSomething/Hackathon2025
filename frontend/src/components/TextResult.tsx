import React from "react";
import { useLocation } from "react-router-dom";

interface ApiResponse {
  promptReceived: string;
  response: string;
  success: boolean;
}

export default function TextResult() {
  const location = useLocation();
  const apiResponse = location.state?.apiResponse as ApiResponse | string;

  // Handle if apiResponse is a string (error case)
  if (typeof apiResponse === 'string') {
    return (
      <div>
        <h2>Response:</h2>
        <p>{apiResponse}</p>
      </div>
    );
  }

  // Handle if apiResponse is an object (success case)
  return (
    <div>
      <h2>Your Question:</h2>
      <p>{apiResponse?.promptReceived}</p>
      
      <h2>Claude's Response:</h2>
      <p>{apiResponse?.response}</p>
    </div>
  );
}