"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface AIContentProps {
  content: string;
  className?: string;
}

export default function AIContent({ content, className = "" }: AIContentProps) {
  return (
    <div className={`ai-content prose prose-slate max-w-none text-slate-700 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-slate-800 mt-4 mb-2 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-slate-800 mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-slate-800 mt-2 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-slate-700 mb-2 font-normal">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-slate-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-slate-700">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
