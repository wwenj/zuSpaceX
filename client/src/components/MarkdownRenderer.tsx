import "./MarkdownRenderer.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import { useState, useCallback, useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** "article" 博客大版式（默认），"chat" 聊天气泡紧凑版 */
  variant?: "article" | "chat";
}

const codeTheme: Record<string, React.CSSProperties> = Object.fromEntries(
  Object.entries(oneDark).map(([key, value]) => [
    key,
    { ...value, background: "transparent", backgroundColor: "transparent" },
  ]),
);

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="md-code-block">
      <div className="md-code-titlebar">
        <div className="md-code-dots">
          <span className="md-dot md-dot-red" />
          <span className="md-dot md-dot-yellow" />
          <span className="md-dot md-dot-green" />
        </div>
        <span className="md-code-lang">{language}</span>
        <div className="md-code-actions">
          <button
            className={`md-code-btn ${showLineNumbers ? "md-code-btn-active" : ""}`}
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            title={showLineNumbers ? "隐藏行号" : "显示行号"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="6" y1="6" x2="6" y2="6" />
              <line x1="6" y1="12" x2="6" y2="12" />
              <line x1="6" y1="18" x2="6" y2="18" />
              <line x1="11" y1="6" x2="20" y2="6" />
              <line x1="11" y1="12" x2="20" y2="12" />
              <line x1="11" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <button
            className={`md-code-btn md-code-copy-btn ${copied ? "md-code-btn-copied" : ""}`}
            onClick={handleCopy}
            title="复制代码"
          >
            {copied ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            <span className="md-copy-label">{copied ? "已复制" : "复制"}</span>
          </button>
        </div>
      </div>
      <div className="md-code-body">
        <SyntaxHighlighter
          style={codeTheme}
          language={language}
          PreTag="div"
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            textAlign: "right",
            userSelect: "none",
            color: "#3a3a5c",
            fontSize: "12px",
          }}
          customStyle={{
            margin: 0,
            padding: "1rem",
            borderRadius: 0,
            background: "transparent",
            fontSize: "13.5px",
            lineHeight: "1.7",
            color: "#e6edf3",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default function MarkdownRenderer({
  content,
  className = "",
  variant = "article",
}: MarkdownRendererProps) {
  const rootClass = variant === "chat" ? "md-renderer md-chat" : "md-renderer";

  const components: Components = {
    code({ className: codeClassName, children, node, ...props }) {
      const match = /language-(\w+)/.exec(codeClassName || "");
      const codeString = String(children).replace(/\n$/, "");
      const isBlock =
        match ||
        node?.position?.start.line !== node?.position?.end.line ||
        codeString.includes("\n");

      if (isBlock) {
        return <CodeBlock language={match?.[1] || "text"} code={codeString} />;
      }

      return (
        <code className="md-inline-code" {...props}>
          {children}
        </code>
      );
    },
    a({ href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="md-link"
          {...props}
        >
          {children}
        </a>
      );
    },
    img({ src, alt, ...props }) {
      return (
        <figure className="md-figure">
          <img src={src} alt={alt || ""} className="md-img" {...props} />
        </figure>
      );
    },
    table({ children, ...props }) {
      return (
        <div className="md-table-wrapper">
          <table className="md-table" {...props}>
            {children}
          </table>
        </div>
      );
    },
  };

  return (
    <div className={`${rootClass} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
