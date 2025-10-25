import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import "../../styles/LatexText.css";

interface LatexTextProps {
  text: string;
}

export default function LatexText({ text }: LatexTextProps) {
  return (
    <div className="latex-container">
      <div className="latex-document">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <p className="latex-paragraph">{children}</p>,
            h1: ({ children }) => <h1 className="latex-section">{children}</h1>,
            h2: ({ children }) => <h2 className="latex-section">{children}</h2>,
            h3: ({ children }) => (
              <h3 className="latex-subsection">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="latex-subsubsection">{children}</h4>
            ),
            ul: ({ children }) => <ul className="latex-list">{children}</ul>,
            ol: ({ children }) => <ol className="latex-list">{children}</ol>,
            hr: () => <hr className="latex-rule" />,
            strong: ({ children }) => <strong>{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
