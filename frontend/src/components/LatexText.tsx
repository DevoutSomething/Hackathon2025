import React from "react";
import "katex/dist/katex.min.css";
import "../../styles/LatexText.css";

interface LatexTextProps {
  text: string;
}

export default function LatexText({ text }: LatexTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const renderLatex = async () => {
      if (!containerRef.current || !text) return;

      const katex = await import("katex");
      
      let html = text;

      // Process LaTeX commands and convert to HTML

      // Handle section headers (LaTeX-style)
      html = html.replace(/\\section\{([^}]+)\}/g, '<h2 class="latex-section">$1</h2>');
      html = html.replace(/\\subsection\{([^}]+)\}/g, '<h3 class="latex-subsection">$1</h3>');
      html = html.replace(/\\subsubsection\{([^}]+)\}/g, '<h4 class="latex-subsubsection">$1</h4>');

      // Handle markdown-style headers and convert to LaTeX style
      html = html.replace(/^## (.+)$/gm, '<h2 class="latex-section">$1</h2>');
      html = html.replace(/^### (.+)$/gm, '<h3 class="latex-subsection">$1</h3>');
      
      // Handle horizontal rules
      html = html.replace(/^---+$/gm, '<hr class="latex-rule">');
      
      // Handle text formatting
      html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
      html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

      // Handle display math ($$...$$ or \[...\])
      html = html.replace(/\$\$([^$]+?)\$\$/g, (match, latex) => {
        try {
          const rendered = katex.default.renderToString(latex.trim(), {
            displayMode: true,
            throwOnError: false,
            trust: true,
            strict: false,
          });
          return `<div class="latex-display-math">${rendered}</div>`;
        } catch (error) {
          console.error("LaTeX display error:", error);
          return `<div class="latex-error">Error: ${latex}</div>`;
        }
      });

      html = html.replace(/\\\[([^\]]+?)\\\]/g, (match, latex) => {
        try {
          const rendered = katex.default.renderToString(latex.trim(), {
            displayMode: true,
            throwOnError: false,
            trust: true,
            strict: false,
          });
          return `<div class="latex-display-math">${rendered}</div>`;
        } catch (error) {
          console.error("LaTeX display error:", error);
          return `<div class="latex-error">Error: ${latex}</div>`;
        }
      });

      // Handle inline math ($...$ or \(...\))
      html = html.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
        try {
          const rendered = katex.default.renderToString(latex.trim(), {
            displayMode: false,
            throwOnError: false,
            trust: true,
            strict: false,
          });
          return `<span class="latex-inline-math">${rendered}</span>`;
        } catch (error) {
          console.error("LaTeX inline error:", error);
          return `<span class="latex-error">Error: ${latex}</span>`;
        }
      });

      html = html.replace(/\\\(([^)]+?)\\\)/g, (match, latex) => {
        try {
          const rendered = katex.default.renderToString(latex.trim(), {
            displayMode: false,
            throwOnError: false,
            trust: true,
            strict: false,
          });
          return `<span class="latex-inline-math">${rendered}</span>`;
        } catch (error) {
          console.error("LaTeX inline error:", error);
          return `<span class="latex-error">Error: ${latex}</span>`;
        }
      });

      // Handle itemize/enumerate lists
      html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
        const items = content.split('\\item').filter((item: string) => item.trim());
        const listItems = items.map((item: string) => `<li>${item.trim()}</li>`).join('');
        return `<ul class="latex-list">${listItems}</ul>`;
      });

      html = html.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
        const items = content.split('\\item').filter((item: string) => item.trim());
        const listItems = items.map((item: string) => `<li>${item.trim()}</li>`).join('');
        return `<ol class="latex-list">${listItems}</ol>`;
      });

      // Handle markdown-style lists
      html = html.replace(/^- (.+)$/gm, '<li class="latex-list-item">$1</li>');
      html = html.replace(/(<li class="latex-list-item">.*<\/li>\n?)+/g, '<ul class="latex-list">$&</ul>');

      // Handle paragraphs
      html = html.replace(/\n\n+/g, '</p><p class="latex-paragraph">');
      html = html.replace(/\n/g, '<br>');
      
      // Wrap in document structure
      html = `<div class="latex-document"><p class="latex-paragraph">${html}</p></div>`;

      containerRef.current.innerHTML = html;
    };

    renderLatex();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="latex-container"
    />
  );
}
