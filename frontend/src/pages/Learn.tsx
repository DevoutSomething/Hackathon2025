import React from "react";
import TextSubmit from "../components/TextSubmit";
import UserSettingsForm from "../components/UserSettingsForm";

export default function Learn() {
  return (
    <div className="learn-page">
      <div className="learn-content">
        <h1 className="learn-title">What would you like to learn?</h1>
        <p className="learn-subtitle">
          Ask any question and get an AI-powered explanation
        </p>
        <UserSettingsForm />
        <TextSubmit />
      </div>
    </div>
  );
}
