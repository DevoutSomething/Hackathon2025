import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "../../styles/LatexText.css";

interface LatexTextProps {
  text: string;
}

export default function LatexText({ text }: LatexTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const processLatex = (content: string): string => {
    let processed = content;

    // Handle display math ($$...$$) - must be done first
    processed = processed.replace(/\$\$([^$]+?)\$\$/g, (match, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: true,
          throwOnError: false,
        });
        console.log("Rendered display math:", latex.trim());
        return `<div class="math-display">${rendered}</div>`;
      } catch (error) {
        console.error("LaTeX rendering error (display):", error);
        return `<span style="color: red;">Error rendering: ${latex}</span>`;
      }
    });

    // Handle inline math ($...$)
    processed = processed.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        console.log("Rendered inline math:", latex.trim());
        return `<span class="math-inline">${rendered}</span>`;
      } catch (error) {
        console.error("LaTeX rendering error (inline):", error);
        return `<span style="color: red;">Error: ${latex}</span>`;
      }
    });

    // Convert newlines to <br> tags
    processed = processed.replace(/\n/g, "<br>");

    return processed;
  };

  React.useEffect(() => {
    if (!containerRef.current || !text) return;

    console.log("Processing text:", text);

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Process the text to find and render LaTeX
    const processedContent = processLatex(text);
    console.log("Processed content:", processedContent);
    containerRef.current.innerHTML = processedContent;
  }, [text]);

  return (
    <div
      ref={containerRef}
      style={{
        lineHeight: "1.8",
        fontSize: "16px",
        padding: "10px",
        minHeight: "20px",
      }}
      className="latex-container"
    />
  );
}
