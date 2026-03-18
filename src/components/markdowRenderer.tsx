import ReactMarkdown from "react-markdown";

interface Props {
  children: string;
}

export default function MarkdownRenderer({ children }: Props) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 leading-7">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-3">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2">{children}</h3>
        ),
        pre: ({ children }) => (
          <pre className="overflow-x-auto rounded-lg p-3 my-3 bg-black/10 dark:bg-white/10 text-sm">
            {children}
          </pre>
        ),
        code: ({ children, className }) =>
          className ? (
            <code className={className}>{children}</code>
          ) : (
            <code className="rounded px-1 py-0.5 bg-black/10 dark:bg-white/10 text-sm">
              {children}
            </code>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

