import React, { useState, useRef } from "react";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./Whiteboard.css";

const Whiteboard: React.FC = () => {
  const excalidrawRef = useRef<any>(null);

  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Convert Blob → Base64 helper
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleAskAI = async () => {
    if (!question.trim() || !excalidrawRef.current) {
      console.log("Missing question or excalidraw ref");
      return;
    }

    setIsLoading(true);
    try {
      // 1️⃣ Capture whiteboard as image using the correct Excalidraw API
      console.log("Getting scene elements...");
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      // Files might not be available in all versions, make it optional
      const files = excalidrawRef.current.getFiles ? excalidrawRef.current.getFiles() : {};
      
      console.log(`Found ${elements.length} elements on whiteboard`);
      console.log("AppState:", appState);
      console.log("Files available:", files ? Object.keys(files).length : 0);
      
      // Export to blob using the Excalidraw exportToBlob function
      console.log("Exporting to blob...");
      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const blob = await exportToBlob({
        elements,
        appState,
        files: files || {},
        mimeType: "image/png",
        quality: 1,
      });

      console.log(`Blob created: ${blob.size} bytes`);

      // 2️⃣ Convert to base64 for sending to backend
      const base64 = await blobToBase64(blob);
      console.log(`Base64 string length: ${base64.length}`);

      // 3️⃣ Send to vision endpoint
      console.log("Sending to vision API...");
      const response = await fetch("http://localhost:3000/userQuestionVision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          question,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      console.log("Response received:", data);
      
      // Check if we got an error response
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }
      
      setAiResponse(data.response || "No response received.");
      
      // Handle AI drawing instructions if present
      if (data.drawData?.elements && Array.isArray(data.drawData.elements)) {
        console.log("Processing AI drawing instructions:", data.drawData.elements);
        drawAIElements(data.drawData.elements);
      }
    } catch (err) {
      console.error("Error calling AI:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setAiResponse(`Failed to get AI response: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const drawAIElements = (aiElements: any[]) => {
    if (!excalidrawRef.current) return;
    
    try {
      // Get current elements
      const currentElements = excalidrawRef.current.getSceneElements();
      
      // Convert AI instructions to Excalidraw elements
      const newElements = aiElements.map((elem, index) => {
        const baseElement = {
          id: `ai-${Date.now()}-${index}`,
          strokeColor: elem.color || "#000000",
          backgroundColor: "transparent",
          fillStyle: "solid" as const,
          strokeWidth: 2,
          strokeStyle: "solid" as const,
          roughness: 1,
          opacity: 100,
          seed: Math.floor(Math.random() * 100000),
          versionNonce: Math.floor(Math.random() * 100000),
          isDeleted: false,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
        };
        
        switch (elem.type) {
          case "rectangle":
            return {
              ...baseElement,
              type: "rectangle" as const,
              x: elem.x || 100,
              y: elem.y || 100,
              width: elem.width || 100,
              height: elem.height || 50,
              angle: 0,
              strokeColor: elem.color || "#000000",
            };
            
          case "ellipse":
            return {
              ...baseElement,
              type: "ellipse" as const,
              x: elem.x || 100,
              y: elem.y || 100,
              width: elem.width || 100,
              height: elem.height || 50,
              angle: 0,
              strokeColor: elem.color || "#000000",
            };
            
          case "diamond":
            return {
              ...baseElement,
              type: "diamond" as const,
              x: elem.x || 100,
              y: elem.y || 100,
              width: elem.width || 100,
              height: elem.height || 50,
              angle: 0,
              strokeColor: elem.color || "#000000",
            };
            
          case "arrow":
            return {
              ...baseElement,
              type: "arrow" as const,
              x: elem.x || 100,
              y: elem.y || 100,
              width: (elem.x2 || 200) - (elem.x || 100),
              height: (elem.y2 || 200) - (elem.y || 100),
              angle: 0,
              points: [[0, 0], [(elem.x2 || 200) - (elem.x || 100), (elem.y2 || 200) - (elem.y || 100)]],
              lastCommittedPoint: null,
              startBinding: null,
              endBinding: null,
              startArrowhead: null,
              endArrowhead: "arrow" as const,
              strokeColor: elem.color || "#000000",
            };
            
          case "line":
            return {
              ...baseElement,
              type: "line" as const,
              x: elem.x || 100,
              y: elem.y || 100,
              width: (elem.x2 || 200) - (elem.x || 100),
              height: (elem.y2 || 200) - (elem.y || 100),
              angle: 0,
              points: [[0, 0], [(elem.x2 || 200) - (elem.x || 100), (elem.y2 || 200) - (elem.y || 100)]],
              lastCommittedPoint: null,
              startBinding: null,
              endBinding: null,
              startArrowhead: null,
              endArrowhead: null,
              strokeColor: elem.color || "#000000",
            };
            
          case "text":
            return {
              ...baseElement,
              type: "text" as const,
              x: elem.x || 100,
              y: elem.y || 100,
              width: elem.text ? elem.text.length * 10 : 100,
              height: 25,
              angle: 0,
              text: elem.text || "Text",
              fontSize: elem.fontSize || 20,
              fontFamily: 1,
              textAlign: "left" as const,
              verticalAlign: "top" as const,
              baseline: 18,
              containerId: null,
              originalText: elem.text || "Text",
              strokeColor: elem.color || "#000000",
            };
            
          default:
            console.warn(`Unknown element type: ${elem.type}`);
            return null;
        }
      }).filter((elem): elem is NonNullable<typeof elem> => elem !== null);
      
      // Convert using Excalidraw's converter if available
      let finalElements;
      try {
        finalElements = convertToExcalidrawElements(newElements as any);
      } catch (e) {
        console.log("Using raw elements (convertToExcalidrawElements not available or failed)");
        finalElements = newElements;
      }
      
      // Update the scene with combined elements
      excalidrawRef.current.updateScene({
        elements: [...currentElements, ...finalElements],
      });
      
      console.log(`Added ${finalElements.length} AI-generated elements to the canvas`);
    } catch (error) {
      console.error("Error drawing AI elements:", error);
    }
  };
  
  const handleClearWhiteboard = () => {
    excalidrawRef.current?.resetScene();
  };

  return (
    <div className="whiteboard-container">
      <button
        className="ai-panel-toggle"
        onClick={() => setShowAiPanel(!showAiPanel)}
      >
        {showAiPanel ? "Hide AI Assistant" : "Show AI Assistant"}
      </button>

      {showAiPanel && (
        <div className="ai-panel">
          <h3>AI Assistant</h3>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your drawing..."
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleAskAI}
            disabled={isLoading || !question.trim()}
            className="ask-ai-btn"
          >
            {isLoading ? "Analyzing..." : "Ask AI"}
          </button>

          {aiResponse && (
            <div className="ai-response">
              <h4>AI Response:</h4>
              <div className="response-content">{aiResponse}</div>
            </div>
          )}

          <button onClick={handleClearWhiteboard} className="clear-btn">
            Clear Whiteboard
          </button>
        </div>
      )}

      <div className="excalidraw-wrapper">
        <Excalidraw
          excalidrawAPI={(api) => (excalidrawRef.current = api)}
          initialData={{
            elements: [],
            appState: {
              viewModeEnabled: false,
              zenModeEnabled: false,
              gridSize: undefined,
              viewBackgroundColor: "#ffffff",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
