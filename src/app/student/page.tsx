"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AIContent from "@/components/AIContent";

function StudentContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId") ?? "";
  const code = searchParams.get("code") ?? "";
  const studentName = searchParams.get("studentName") ?? "";
  const studentId = searchParams.get("studentId") ?? "";

  const [tab, setTab] = useState<"ask" | "exercises" | "exit">("ask");

  const [myQuestion, setMyQuestion] = useState("");
  const [myQuestions, setMyQuestions] = useState<any[]>([]);
  const [askLoading, setAskLoading] = useState(false);
  const [confusion, setConfusion] = useState<{ confusionDetected: boolean; suggestedRephrases: string[]; explanation?: string } | null>(null);
  const [confusionLoading, setConfusionLoading] = useState(false);

  const [releasedQuestions, setReleasedQuestions] = useState<any[]>([]);
  const [myAnswers, setMyAnswers] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState<string | null>(null);

  const [requestAiQuestionId, setRequestAiQuestionId] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const [exitFeedback, setExitFeedback] = useState("");
  const [exitWhatLearned, setExitWhatLearned] = useState("");
  const [exitSubmitted, setExitSubmitted] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const refreshMyQuestions = useCallback(() => {
    if (!classId) return;
    fetch(`/api/student-question?classId=${classId}`)
      .then((r) => r.json())
      .then((all: any[]) => setMyQuestions(all.filter((q: any) => q.studentId === studentId)))
      .catch(() => setMyQuestions([]));
  }, [classId, studentId]);

  const refreshReleased = useCallback(() => {
    if (!classId) return;
    fetch(`/api/questions?classId=${classId}`)
      .then((r) => r.json())
      .then(setReleasedQuestions)
      .catch(() => setReleasedQuestions([]));
  }, [classId]);

  useEffect(() => {
    refreshMyQuestions();
    const t = setInterval(refreshMyQuestions, 5000);
    return () => clearInterval(t);
  }, [refreshMyQuestions]);

  useEffect(() => {
    refreshReleased();
    const t = setInterval(refreshReleased, 5000);
    return () => clearInterval(t);
  }, [refreshReleased]);

  async function handleAskQuestion() {
    if (!myQuestion.trim() || !classId) return;
    setAskLoading(true);
    setConfusion(null);
    setActionError("");
    try {
      const res = await fetch("/api/student-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentName,
          studentId,
          text: myQuestion.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMyQuestion("");
        refreshMyQuestions();
      } else setActionError(data.error || "Failed to send question.");
    } catch {
      setActionError("Network error.");
    } finally {
      setAskLoading(false);
    }
  }

  async function checkConfusion() {
    if (!myQuestion.trim() || !classId) return;
    setConfusionLoading(true);
    setConfusion(null);
    try {
      const res = await fetch("/api/confusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, text: myQuestion.trim() }),
      });
      const data = await res.json();
      if (res.ok) setConfusion(data);
    } finally {
      setConfusionLoading(false);
    }
  }

  async function requestAiAnswer(questionId: string) {
    setRequestAiQuestionId(questionId);
    setAiAnswer(null);
    setActionError("");
    try {
      const res = await fetch("/api/answer-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const data = await res.json();
      if (res.ok) setAiAnswer(data.answer);
      else setActionError(data.error || "Failed to get AI answer.");
    } catch {
      setActionError("Network error.");
    } finally {
      setRequestAiQuestionId(null);
      refreshMyQuestions();
    }
  }

  async function submitAnswer(questionId: string) {
    const answer = myAnswers[questionId]?.trim();
    if (!answer || !classId) return;
    setSubmitLoading(questionId);
    setActionError("");
    try {
      const res = await fetch("/api/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          classId,
          studentName,
          studentId,
          answer,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMyAnswers((p) => ({ ...p, [questionId]: "" }));
        refreshReleased();
      } else setActionError(data.error || "Failed to submit answer.");
    } catch {
      setActionError("Network error.");
    } finally {
      setSubmitLoading(null);
    }
  }

  async function submitExitTicket() {
    if (!classId) return;
    setExitLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/exit-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentName,
          studentId,
          feedback: exitFeedback.trim(),
          whatLearned: exitWhatLearned.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) setExitSubmitted(true);
      else setActionError(data.error || "Failed to submit exit ticket.");
    } catch {
      setActionError("Network error.");
    } finally {
      setExitLoading(false);
    }
  }

  if (!classId || !studentId) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-red-600">Missing class or student info. Join from home.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">Student — {studentName}</h1>
        <p className="text-sm text-slate-500">Class code: <span className="font-mono font-semibold">{code}</span></p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTab("ask")}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${tab === "ask" ? "btn-primary" : "btn-muted"}`}
          >
            Ask a question
          </button>
          <button
            onClick={() => setTab("exercises")}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${tab === "exercises" ? "btn-success" : "btn-muted"}`}
          >
            Exercises
          </button>
          <button
            onClick={() => setTab("exit")}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${tab === "exit" ? "btn-info" : "btn-muted"}`}
          >
            Exit ticket
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {actionError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError("")} className="text-red-500 hover:text-red-700 font-medium">Dismiss</button>
          </div>
        )}
        {tab === "ask" && (
          <div className="space-y-4">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Ask your teacher</h2>
              <p className="text-sm text-slate-500 mb-3">Your question appears on the teacher&apos;s screen. If you need a quick answer or the teacher doesn&apos;t respond, you can get an AI answer based on the lesson.</p>
              <textarea
                value={myQuestion}
                onChange={(e) => setMyQuestion(e.target.value)}
                placeholder="Type your question..."
                className="w-full h-24 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={handleAskQuestion}
                  disabled={askLoading || !myQuestion.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {askLoading ? "Sending…" : "Send to teacher"}
                </button>
                <button
                  onClick={checkConfusion}
                  disabled={confusionLoading || !myQuestion.trim()}
                  className="btn-muted disabled:opacity-50"
                >
                  {confusionLoading ? "Checking…" : "Check for confusion"}
                </button>
              </div>
              {confusion && (
                <div className="mt-4 p-4 rounded-lg border-2 border-primary-200 bg-primary-50">
                  {confusion.confusionDetected ? (
                    <>
                      <p className="font-semibold text-primary-800">Confusion detected</p>
                      {confusion.explanation && <p className="text-sm text-slate-700 mt-1">{confusion.explanation}</p>}
                      {confusion.suggestedRephrases.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-primary-700">Suggested rephrases</p>
                          <ul className="list-disc list-inside text-sm text-slate-700 mt-1">
                            {confusion.suggestedRephrases.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-700">No confusion detected. Your question looks clear.</p>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">My questions</h2>
              {myQuestions.length === 0 ? (
                <p className="text-slate-500">You haven&apos;t asked anything yet.</p>
              ) : (
                <ul className="space-y-3">
                  {myQuestions.map((q) => {
                    const createdAt = typeof q.createdAt === "number" ? q.createdAt : 0;
                    const oneMinutePassed = Date.now() - createdAt >= 60000;
                    return (
                    <li key={q.id} className="border border-slate-200 rounded-lg p-3">
                      <p className="text-slate-800 font-medium">{q.text}</p>
                      {q.resolved && (
                        <div className="mt-2 text-sm">
                          {q.teacherAnswered && <p className="text-green-700"><strong>Teacher:</strong> {q.teacherAnswered}</p>}
                          {q.aiAnswered && <div className="text-primary-700 mt-1"><strong>AI:</strong> <AIContent content={q.aiAnswered} /></div>}
                        </div>
                      )}
                      {!q.resolved && oneMinutePassed && (
                        <button
                          onClick={() => requestAiAnswer(q.id)}
                          disabled={requestAiQuestionId === q.id}
                          className="mt-2 btn-info text-sm disabled:opacity-50"
                        >
                          {requestAiQuestionId === q.id ? "Getting answer…" : "Ask AI (teacher has not responded for 1 min)"}
                        </button>
                      )}
                      {!q.resolved && !oneMinutePassed && (
                        <p className="mt-2 text-xs text-slate-500">Wait 1 minute for teacher to respond, then you can ask AI.</p>
                      )}
                    </li>
                    );
                  })}
                </ul>
              )}
              {aiAnswer && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-xs font-bold text-primary-700">AI answer</p>
                  <div className="text-slate-700 mt-1"><AIContent content={aiAnswer} /></div>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "exercises" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Class questions</h2>
            <p className="text-sm text-slate-500 mb-4">Answer the questions your teacher has released. Your answers are sent to the teacher and the AI will help analyze how the class is doing.</p>
            {releasedQuestions.length === 0 ? (
              <p className="text-slate-500">No questions released yet.</p>
            ) : (
              <ul className="space-y-4">
                {releasedQuestions.map((q) => (
                  <li key={q.id} className="border border-slate-200 rounded-lg p-4">
                    <p className="font-medium text-slate-800">Q{q.index + 1}: {q.text}</p>
                    <textarea
                      value={myAnswers[q.id] ?? ""}
                      onChange={(e) => setMyAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      placeholder="Your answer..."
                      className="w-full mt-2 h-20 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => submitAnswer(q.id)}
                      disabled={submitLoading === q.id || !(myAnswers[q.id]?.trim())}
                      className="mt-2 btn-success px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      {submitLoading === q.id ? "Submitting…" : "Submit answer"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "exit" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Exit ticket</h2>
            <p className="text-sm text-slate-500 mb-4">Share feedback on today&apos;s lesson. The teacher will see a summary and get suggestions for the next lesson.</p>
            {exitSubmitted ? (
              <p className="text-green-700 font-medium">Thanks! Your feedback was submitted.</p>
            ) : (
              <>
                <label className="block text-sm font-medium text-slate-700 mt-2">Feedback (what was clear, what was confusing, etc.)</label>
                <textarea
                  value={exitFeedback}
                  onChange={(e) => setExitFeedback(e.target.value)}
                  placeholder="e.g. The examples were helpful. I got lost when we did the second problem."
                  className="w-full h-24 mt-1 px-4 py-2 border border-slate-200 rounded-lg"
                />
                <label className="block text-sm font-medium text-slate-700 mt-3">What I learned</label>
                <textarea
                  value={exitWhatLearned}
                  onChange={(e) => setExitWhatLearned(e.target.value)}
                  placeholder="e.g. How to solve 2x + 5 = 15"
                  className="w-full h-20 mt-1 px-4 py-2 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={submitExitTicket}
                  disabled={exitLoading}
                  className="mt-4 btn-info disabled:opacity-50"
                >
                  {exitLoading ? "Submitting…" : "Submit exit ticket"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>}>
      <StudentContent />
    </Suspense>
  );
}
