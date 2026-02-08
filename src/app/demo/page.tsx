"use client";

import { useState } from "react";

export default function DemoPage() {
  const [teacherUrl, setTeacherUrl] = useState("/");
  const [studentUrl, setStudentUrl] = useState("/");
  const [classCode, setClassCode] = useState("");
  const [studentName, setStudentName] = useState("Demo Student");

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
          Classroom AI — iPad simulation
        </h1>
        <p className="text-slate-600 text-center mb-6">
          Use the two iPads below: create a class on the left, join with the code on the right. All features work.
        </p>

        {/* Quick sync: paste class code for student */}
        <div className="flex flex-wrap gap-3 justify-center mb-6 p-3 bg-slate-100 rounded-xl border border-slate-200">
          <span className="text-slate-700 text-sm self-center">After creating class (left), paste code here:</span>
          <input
            type="text"
            placeholder="Class code (e.g. ABC123)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 w-32 uppercase font-mono"
          />
          <input
            type="text"
            placeholder="Student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 w-40"
          />
          <button
            type="button"
            onClick={() => {
              if (classCode.trim()) {
                const params = new URLSearchParams();
                params.set("role", "student");
                params.set("code", classCode.trim().toUpperCase());
                params.set("studentName", studentName.trim());
                const qs = params.toString();
                setStudentUrl(`/?${qs}`);
                const iframe = document.getElementById("student-iframe") as HTMLIFrameElement;
                if (iframe) iframe.src = `/?${qs}`;
              }
            }}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Open student join with this code
          </button>
          <button
            type="button"
            onClick={() => {
              setTeacherUrl("/");
              setStudentUrl("/");
              const t = document.getElementById("teacher-iframe") as HTMLIFrameElement;
              const s = document.getElementById("student-iframe") as HTMLIFrameElement;
              if (t) t.src = "/";
              if (s) s.src = "/";
            }}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-medium hover:bg-slate-300"
          >
            Reset both
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 place-items-center">
          {/* Teacher iPad */}
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-slate-700 font-medium mb-2">Teacher</p>
            <div className="ipad-frame ipad-air">
              <div className="ipad-screen">
                <iframe
                  id="teacher-iframe"
                  title="Teacher"
                  src={teacherUrl}
                  className="w-full h-full border-0 rounded-[2rem] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Student iPad */}
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-slate-700 font-medium mb-2">Student</p>
            <div className="ipad-frame ipad-air">
              <div className="ipad-screen">
                <iframe
                  id="student-iframe"
                  title="Student"
                  src={studentUrl}
                  className="w-full h-full border-0 rounded-[2rem] bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
