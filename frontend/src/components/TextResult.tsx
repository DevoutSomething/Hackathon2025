import React from "react";
import { useLocation } from "react-router-dom";
import LatexText from "./latexText";
interface ApiResponse {
  promptReceived: string;
  response: string;
  success: boolean;
}

export default function TextResult() {
  const location = useLocation();
  const apiResponse = location.state?.apiResponse as ApiResponse | string;

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
      <LatexText text="$$\sqrt{x + 3}$$"/>
      <br/>
      <LatexText text="Inline example: $E = mc^2$ and more text"/>
      <br/>
      <LatexText text="$$\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$"/>
    </div>
  );
}