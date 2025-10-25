import React from "react";
import { useLocation } from "react-router-dom";
import LatexText from "./LatexText";
interface ApiResponse {
  promptReceived: string;
  response: string;
  success: boolean;
}

export default function TextResult() {
  const location = useLocation();
  const apiResponse = location.state?.apiResponse as ApiResponse | string;

  if (typeof apiResponse === "string") {
    return (
      <div>
        <h2>Response:</h2>
        <p>{"$$" + apiResponse + "$$"}</p>
      </div>
    );
  }

  return (
    <div>
        <LatexText text={apiResponse.response} />
    </div>
  );
}