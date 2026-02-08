"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from URL (e.g. demo: ?role=student&code=ABC123&studentName=Demo)
  useEffect(() => {
    const p = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const r = p.get("role");
    const c = p.get("code");
    const n = p.get("studentName");
    if (r === "student" && c) {
      setRole("student");
      setClassCode(c.toUpperCase());
      if (n) setStudentName(n);
    }
  }, []);

  async function handleCreateClass() {
    if (!teacherName.trim()) {
      setError("Enter your name");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherName: teacherName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");
      const params = new URLSearchParams({
        classId: data.id,
        code: data.code,
        teacherName: data.teacherName,
      });
      window.location.href = `/teacher?${params.toString()}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinClass() {
    if (!classCode.trim() || !studentName.trim()) {
      setError("Enter class code and your name");
      return;
    }
    setJoining(true);
    setError("");
    try {
      const res = await fetch(`/api/class?code=${encodeURIComponent(classCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Class not found");
      const params = new URLSearchParams({
        classId: data.id,
        code: data.code,
        studentName: studentName.trim(),
        studentId: crypto.randomUUID(),
      });
      window.location.href = `/student?${params.toString()}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="min-h-screen min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 box-border">
      <div className="w-full max-w-md flex flex-col items-center justify-center mx-auto text-center scale-90 origin-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Classroom AI
        </h1>
        <p className="text-slate-600 text-sm mb-3">
          Teaching notes, Q&A, exit tickets — powered by Gemini
        </p>
        <p className="mb-4">
          <a href="/demo" className="text-primary-600 hover:underline text-xs font-medium">
            Open iPad simulation (demo) →
          </a>
        </p>

        {role === null ? (
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setRole("teacher")}
              className="btn-primary px-5 py-2.5 text-sm shrink-0"
            >
              I&apos;m a Teacher
            </button>
            <button
              onClick={() => setRole("student")}
              className="btn-accent px-5 py-2.5 text-sm shrink-0"
            >
              I&apos;m a Student
            </button>
          </div>
        ) : role === "teacher" ? (
          <div className="bg-white rounded-2xl shadow-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Start a class</h2>
            <input
              type="text"
              placeholder="Your name"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setRole(null)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700"
              >
                Back
              </button>
              <button
                onClick={handleCreateClass}
                disabled={creating}
                className="flex-1 btn-success disabled:opacity-50 text-sm py-2"
              >
                {creating ? "Creating…" : "Create class"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Join a class</h2>
            <input
              type="text"
              placeholder="Class code (e.g. ABC123)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
              maxLength={6}
            />
            <input
              type="text"
              placeholder="Your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setRole(null)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700"
              >
                Back
              </button>
              <button
                onClick={handleJoinClass}
                disabled={joining}
                className="flex-1 btn-accent disabled:opacity-50 text-sm py-2"
              >
                {joining ? "Joining…" : "Join class"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
