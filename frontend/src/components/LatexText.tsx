import React, { type JSX } from "react";
import "katex/dist/katex.min.css";
import "../../styles/LatexText.css";

interface LatexTextProps {
  text: string;
}

export default function LatexText({ text }: LatexTextProps) {
  const [processedContent, setProcessedContent] = React.useState<JSX.Element[]>([]);

  React.useEffect(() => {
    const renderLatex = async () => {
      // Dynamically import KaTeX to ensure it loads properly
      const katex = await import("katex");
      
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      let key = 0;

      // Find all display math ($$...$$)
      const displayMathRegex = /\$\$([^$]+?)\$\$/g;
      const inlineMathRegex = /\$([^$\n]+?)\$/g;

      let tempText = text;
      
      // First, handle display math
      let displayMatch;
      const displayMatches: Array<{start: number, end: number, latex: string}> = [];
      
      while ((displayMatch = displayMathRegex.exec(text)) !== null) {
        displayMatches.push({
          start: displayMatch.index,
          end: displayMatch.index + displayMatch[0].length,
          latex: displayMatch[1]
        });
      }

      // Then handle inline math
      let inlineMatch;
      const inlineMatches: Array<{start: number, end: number, latex: string}> = [];
      
      while ((inlineMatch = inlineMathRegex.exec(text)) !== null) {
        // Make sure this isn't part of a display math
        const isInDisplayMath = displayMatches.some(
          dm => inlineMatch!.index >= dm.start && inlineMatch!.index < dm.end
        );
        if (!isInDisplayMath) {
          inlineMatches.push({
            start: inlineMatch.index,
            end: inlineMatch.index + inlineMatch[0].length,
            latex: inlineMatch[1]
          });
        }
      }

      // Combine and sort all matches
      const allMatches = [
        ...displayMatches.map(m => ({...m, type: 'display' as const})),
        ...inlineMatches.map(m => ({...m, type: 'inline' as const}))
      ].sort((a, b) => a.start - b.start);

      // Build the content
      lastIndex = 0;
      for (const match of allMatches) {
        // Add text before the math
        if (match.start > lastIndex) {
          const textBefore = text.substring(lastIndex, match.start);
          if (textBefore) {
            parts.push(<span key={key++}>{textBefore}</span>);
          }
        }

        // Render the math
        try {
          const html = katex.default.renderToString(match.latex.trim(), {
            displayMode: match.type === 'display',
            throwOnError: false,
            trust: true,
          });

          if (match.type === 'display') {
            parts.push(
              <div 
                key={key++} 
                className="math-display"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } else {
            parts.push(
              <span 
                key={key++} 
                className="math-inline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }
        } catch (error) {
          console.error("LaTeX rendering error:", error);
          parts.push(
            <span key={key++} style={{ color: 'red' }}>
              Error: {match.latex}
            </span>
          );
        }

        lastIndex = match.end;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        if (remainingText) {
          parts.push(<span key={key++}>{remainingText}</span>);
        }
      }

      setProcessedContent(parts);
    };

    renderLatex();
  }, [text]);

  return (
    <div
      style={{
        lineHeight: "1.8",
        fontSize: "16px",
        padding: "10px",
        minHeight: "20px",
      }}
      className="latex-container"
    >
      {processedContent}
    </div>
  );
}
