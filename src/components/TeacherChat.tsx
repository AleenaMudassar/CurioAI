"use client";

import { useState, useRef, useEffect } from "react";
import AIContent from "./AIContent";

interface TeacherChatProps {
  classId: string;
  onClose: () => void;
}

export default function TeacherChat({ classId, onClose }: TeacherChatProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch("/api/teacher-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, message: userMessage }),
      });
      const data = await res.json();
      const response = res.ok ? data.response : (data.error || "Something went wrong.");
      setMessages((m) => [...m, { role: "assistant", text: response }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Failed to get response." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
        <span className="font-semibold">Ask Gemini</span>
        <button onClick={onClose} className="text-white/90 hover:text-white text-xl leading-none">
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]">
        {messages.length === 0 && (
          <p className="text-slate-500 text-sm">
            Ask anything about your curriculum or how to teach a concept. Answers are based on your uploaded lesson and notes.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 text-sm ${
              msg.role === "user"
                ? "bg-primary-100 text-slate-800 ml-6"
                : "bg-slate-100 text-slate-800 mr-6"
            }`}
          >
            {msg.role === "user" ? msg.text : <AIContent content={msg.text} className="!my-0 text-sm" />}
          </div>
        ))}
        {loading && (
          <div className="rounded-lg p-3 text-sm bg-slate-100 text-slate-500">Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your lesson..."
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
