import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css"; // ✅ correct CSS path

const Whiteboard: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
      }}
    >
      <Excalidraw
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
  );
};

export default Whiteboard;
