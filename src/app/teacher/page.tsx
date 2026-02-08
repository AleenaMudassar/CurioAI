"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import TeacherChat from "@/components/TeacherChat";
import AIContent from "@/components/AIContent";

type Tab = "lesson" | "questions" | "exercises" | "exit" | "progress";

function TeacherContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId") ?? "";
  const code = searchParams.get("code") ?? "";
  const teacherName = searchParams.get("teacherName") ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("lesson");
  const [showChat, setShowChat] = useState(false);

  const [lessonPlan, setLessonPlan] = useState("");
  const [teachingNotes, setTeachingNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");

  const [studentQuestions, setStudentQuestions] = useState<any[]>([]);
  const [teacherAnswer, setTeacherAnswer] = useState<Record<string, string>>({});
  const [releasedQuestions, setReleasedQuestions] = useState<any[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, any[]>>({});
  const [analysis, setAnalysis] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const [exitTickets, setExitTickets] = useState<any[]>([]);
  const [exitSummary, setExitSummary] = useState<{ summary: string; suggestionsForNextLesson: string } | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const [progress, setProgress] = useState<any[]>([]);
  const [kidConcerns, setKidConcerns] = useState("");
  const [kidConcernsLoading, setKidConcernsLoading] = useState(false);

  const refreshQuestions = useCallback(() => {
    if (!classId) return;
    fetch(`/api/student-question?classId=${classId}`)
      .then((r) => r.json())
      .then(setStudentQuestions)
      .catch(() => setStudentQuestions([]));
  }, [classId]);

  const refreshReleased = useCallback(() => {
    if (!classId) return;
    fetch(`/api/questions?classId=${classId}`)
      .then((r) => r.json())
      .then(setReleasedQuestions)
      .catch(() => setReleasedQuestions([]));
  }, [classId]);

  const refreshAnswers = useCallback(() => {
    if (!classId) return;
    fetch(`/api/answers?classId=${classId}`)
      .then((r) => r.json())
      .then((answers: any[]) => {
        const byQ: Record<string, any[]> = {};
        answers.forEach((a) => {
          if (!byQ[a.questionId]) byQ[a.questionId] = [];
          byQ[a.questionId].push(a);
        });
        setAnswersByQuestion(byQ);
      })
      .catch(() => setAnswersByQuestion({}));
  }, [classId]);

  const refreshExitTickets = useCallback(() => {
    if (!classId) return;
    fetch(`/api/exit-ticket?classId=${classId}`)
      .then((r) => r.json())
      .then(setExitTickets)
      .catch(() => setExitTickets([]));
    fetch(`/api/exit-ticket-summary?classId=${classId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setExitSummary({ summary: data.summary, suggestionsForNextLesson: data.suggestionsForNextLesson }))
      .catch(() => setExitSummary(null));
  }, [classId]);

  const refreshProgress = useCallback(() => {
    if (!classId) return;
    fetch(`/api/student-progress?classId=${classId}`)
      .then((r) => r.json())
      .then(setProgress)
      .catch(() => setProgress([]));
  }, [classId]);

  useEffect(() => {
    refreshQuestions();
    const t = setInterval(refreshQuestions, 5000);
    return () => clearInterval(t);
  }, [refreshQuestions]);

  useEffect(() => {
    refreshReleased();
    refreshAnswers();
    const t = setInterval(() => {
      refreshReleased();
      refreshAnswers();
    }, 5000);
    return () => clearInterval(t);
  }, [refreshReleased, refreshAnswers]);

  useEffect(() => {
    if (activeTab === "exit") refreshExitTickets();
    if (activeTab === "progress") refreshProgress();
  }, [activeTab, refreshExitTickets, refreshProgress]);

  async function handleUploadLesson() {
    if (!lessonPlan.trim() || !classId) return;
    setNotesLoading(true);
    setNotesError("");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000); // 90s timeout so we don't hang
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, lessonPlan: lessonPlan.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok) {
        setTeachingNotes(data.teachingNotes ?? "");
        if ((data.teachingNotes ?? "").includes("GEMINI_API_KEY")) {
          setNotesError("Add GEMINI_API_KEY to .env.local and restart the app. Get a key at https://aistudio.google.com/apikey");
        }
      } else {
        setNotesError(data.error || "Failed to generate teaching notes.");
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === "AbortError") {
        setNotesError("Request timed out (90s). If you're over the API quota, it resets at midnight Pacific Time—try again later.");
      } else {
        setNotesError(e instanceof Error ? e.message : "Network error. Is the app running?");
      }
    } finally {
      setNotesLoading(false);
    }
  }

  async function sendTeacherAnswer(questionId: string) {
    const answer = teacherAnswer[questionId]?.trim();
    if (!answer) return;
    setActionError("");
    try {
      const res = await fetch("/api/teacher-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || "Failed to send answer.");
        return;
      }
      setTeacherAnswer((p) => ({ ...p, [questionId]: "" }));
      refreshQuestions();
    } catch {
      setActionError("Network error.");
    }
  }

  async function requestAiAnswer(questionId: string) {
    setActionError("");
    try {
      const res = await fetch("/api/answer-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to get AI answer.");
        return;
      }
      refreshQuestions();
    } catch {
      setActionError("Network error.");
    }
  }

  async function releaseQuestion() {
    if (!newQuestionText.trim() || !classId) return;
    setActionError("");
    try {
      const res = await fetch("/api/questions/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          index: releasedQuestions.length,
          text: newQuestionText.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || "Failed to release question.");
        return;
      }
      setNewQuestionText("");
      refreshReleased();
    } catch {
      setActionError("Network error.");
    }
  }

  async function runAnalysis(questionId: string) {
    setAnalyzing(questionId);
    setActionError("");
    try {
      const res = await fetch("/api/analyze-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const data = await res.json();
      if (res.ok) setAnalysis((a) => ({ ...a, [questionId]: data.summary }));
      else setActionError(data.error || "Failed to analyze. Add GEMINI_API_KEY for AI.");
    } catch {
      setActionError("Network error.");
    } finally {
      setAnalyzing(null);
      refreshAnswers();
    }
  }

  async function summarizeKidConcernsEndOfLesson() {
    if (!classId) return;
    setKidConcernsLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/kid-concerns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();
      if (res.ok) setKidConcerns(data.summary);
      else setActionError(data.error || "Failed to summarize.");
    } catch {
      setActionError("Network error.");
    } finally {
      setKidConcernsLoading(false);
    }
  }

  async function summarizeExitTickets() {
    if (!classId) return;
    setSummarizing(true);
    setActionError("");
    try {
      const res = await fetch("/api/summarize-exit-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();
      if (res.ok) setExitSummary({ summary: data.summary, suggestionsForNextLesson: data.suggestionsForNextLesson });
      else setActionError(data.error || "Failed to summarize. Add GEMINI_API_KEY for AI.");
    } catch {
      setActionError("Network error.");
    } finally {
      setSummarizing(false);
      refreshExitTickets();
    }
  }

  async function fetchAnalysis(questionId: string) {
    const res = await fetch(`/api/analysis?questionId=${questionId}`);
    if (res.ok) {
      const data = await res.json();
      setAnalysis((a) => ({ ...a, [questionId]: data.summary }));
    }
  }

  useEffect(() => {
    releasedQuestions.forEach((q) => {
      if (!analysis[q.id]) fetchAnalysis(q.id);
    });
  }, [releasedQuestions]);

  if (!classId) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-red-600">Missing class. Go to home and create a class.</p>
      </main>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "lesson", label: "Lesson & notes" },
    { id: "questions", label: "Student questions" },
    { id: "exercises", label: "Exercises & analysis" },
    { id: "exit", label: "Exit tickets" },
    { id: "progress", label: "Student progress" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">Teacher — {teacherName}</h1>
        <p className="text-sm text-slate-500">Class code: <span className="font-mono font-semibold">{code}</span></p>
        <div className="flex flex-wrap gap-2 mt-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${activeTab === t.id ? "btn-primary" : "btn-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {actionError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError("")} className="text-red-500 hover:text-red-700 font-medium">Dismiss</button>
          </div>
        )}
        {activeTab === "lesson" && (
          <div className="space-y-4">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Upload lesson plan</h2>
              <p className="text-sm text-slate-500 mb-3">Paste your plan for the day. AI will generate teaching notes.</p>
              <textarea
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                placeholder="e.g. Today we cover quadratic equations: definition, standard form, solving by factoring..."
                className="w-full h-32 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {notesError && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{notesError}</p>
              )}
              <button
                onClick={handleUploadLesson}
                disabled={notesLoading}
                className="mt-2 btn-primary disabled:opacity-50"
              >
                {notesLoading ? "Generating…" : "Generate teaching notes"}
              </button>
            </section>
            {teachingNotes && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Teaching notes</h2>
                <AIContent content={teachingNotes} />
              </section>
            )}
          </div>
        )}

        {activeTab === "questions" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Student questions</h2>
            <p className="text-sm text-slate-500 mb-4">Questions appear here. Use the AI suggestion or type your own answer.</p>
            {studentQuestions.length === 0 ? (
              <p className="text-slate-500">No questions yet.</p>
            ) : (
              <ul className="space-y-4">
                {studentQuestions.map((q) => (
                  <li key={q.id} className="border border-slate-200 rounded-lg p-4">
                    <p className="font-medium text-slate-800">{q.studentName}</p>
                    <p className="text-slate-700 mt-1">{q.text}</p>
                    {q.aiSuggestion && (
                      <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                        <span className="text-xs font-bold text-primary-700">Suggested answer (AI)</span>
                        <div className="text-sm mt-1"><AIContent content={q.aiSuggestion} /></div>
                      </div>
                    )}
                    {q.resolved ? (
                      <div className="mt-2 text-sm">
                        <span className="font-bold text-slate-700">Answered: </span>
                        <span className="text-green-700">{(q.teacherAnswered || q.aiAnswered || "—").slice(0, 200)}{(q.teacherAnswered || q.aiAnswered)?.length > 200 ? "…" : ""}</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={teacherAnswer[q.id] ?? ""}
                          onChange={(e) => setTeacherAnswer((p) => ({ ...p, [q.id]: e.target.value }))}
                          placeholder="Type your answer..."
                          className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-xl text-sm"
                        />
                        <button onClick={() => sendTeacherAnswer(q.id)} className="btn-success px-3 py-2 text-sm">
                          Send answer
                        </button>
                        <button onClick={() => requestAiAnswer(q.id)} className="btn-muted px-3 py-2 text-sm">
                          Let AI answer
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "exercises" && (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Release a question</h2>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. Solve for x: 2x + 5 = 15"
                className="w-full h-20 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={releaseQuestion}
                disabled={!newQuestionText.trim()}
                className="mt-2 btn-warning disabled:opacity-50"
              >
                Release question
              </button>
            </section>
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Submitted answers & analysis</h2>
              {releasedQuestions.length === 0 ? (
                <p className="text-slate-500">No questions released yet.</p>
              ) : (
                <ul className="space-y-4">
                  {releasedQuestions.map((q) => {
                    const answers = answersByQuestion[q.id] ?? [];
                    return (
                      <li key={q.id} className="border border-slate-200 rounded-lg p-4">
                        <p className="font-medium text-slate-800">Q{q.index + 1}: {q.text}</p>
                        <p className="text-sm text-slate-500 mt-1">{answers.length} answer(s)</p>
                        {answers.length > 0 && (
                          <>
                            <ul className="mt-2 space-y-1 text-sm">
                              {answers.map((a) => (
                                <li key={a.id}><span className="font-medium">{a.studentName}:</span> {a.answer}</li>
                              ))}
                            </ul>
                            <button
                              onClick={() => runAnalysis(q.id)}
                              disabled={analyzing === q.id}
                              className="mt-3 btn-info px-3 py-1.5 text-sm disabled:opacity-50"
                            >
                              {analyzing === q.id ? "Analyzing…" : "Analyze with AI"}
                            </button>
                          </>
                        )}
                        {analysis[q.id] && (
                          <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                            <span className="text-xs font-bold text-primary-700">AI summary</span>
                            <div className="text-sm mt-1"><AIContent content={analysis[q.id]} /></div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}

        {activeTab === "exit" && (
          <div className="space-y-6">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Exit ticket feedback</h2>
              {exitTickets.length === 0 ? (
                <p className="text-slate-500">No exit tickets yet.</p>
              ) : (
                <ul className="space-y-3">
                  {exitTickets.map((t) => (
                    <li key={t.id} className="border border-slate-200 rounded-lg p-3">
                      <p className="font-medium text-slate-800">{t.studentName}</p>
                      <p className="text-sm text-slate-600">{t.feedback}</p>
                      <p className="text-sm text-slate-500 mt-1">Learned: {t.whatLearned}</p>
                    </li>
                  ))}
                </ul>
              )}
              {exitTickets.length > 0 && (
                <>
                  <button
                    onClick={summarizeExitTickets}
                    disabled={summarizing}
                    className="mt-4 btn-info disabled:opacity-50"
                  >
                    {summarizing ? "Summarizing…" : "Summarize & get suggestions"}
                  </button>
                  <button
                    onClick={summarizeKidConcernsEndOfLesson}
                    disabled={kidConcernsLoading}
                    className="mt-4 ml-2 btn-accent disabled:opacity-50"
                  >
                    {kidConcernsLoading ? "Generating…" : "End of lesson: These were the kid concerns"}
                  </button>
                </>
              )}
            </section>
            {kidConcerns && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-2">These were the kid concerns</h2>
                <AIContent content={kidConcerns} />
              </section>
            )}
            {exitSummary && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Summary</h2>
                <AIContent content={exitSummary.summary} />
                <h3 className="text-base font-bold text-slate-800 mt-4 mb-2">Suggestions for next lesson</h3>
                <AIContent content={exitSummary.suggestionsForNextLesson} />
              </section>
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Student progress</h2>
            {progress.length === 0 ? (
              <p className="text-slate-500">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {progress.map((s) => (
                  <li key={s.studentId} className="border border-slate-200 rounded-lg p-4">
                    <p className="font-medium text-slate-800">{s.studentName}</p>
                    <p className="text-sm text-slate-600">Questions asked: {s.questionsAsked} · Answers submitted: {s.answersSubmitted}</p>
                    {s.questions?.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Questions: {s.questions.map((q: any) => q.text).join("; ").slice(0, 80)}…
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-primary-700 transition z-40"
        title="Ask Gemini"
      >
        ◆
      </button>
      {showChat && <TeacherChat classId={classId} onClose={() => setShowChat(false)} />}
    </main>
  );
}

export default function TeacherPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>}>
      <TeacherContent />
    </Suspense>
  );
}
