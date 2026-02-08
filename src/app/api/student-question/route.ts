import { NextRequest, NextResponse } from "next/server";
import {
  getClass,
  addStudentQuestion,
  getStudentQuestionsByClass,
  setQuestionSuggestion,
} from "@/lib/store";
import { suggestAnswerToStudentQuestion } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { classId, studentName, studentId, text } = await req.json();
    if (!classId || !studentName?.trim() || !studentId || !text?.trim()) {
      return NextResponse.json(
        { error: "classId, studentName, studentId, text required" },
        { status: 400 }
      );
    }
    const c = getClass(classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const q = addStudentQuestion(classId, studentName.trim(), studentId, text.trim());
    const suggestion = await suggestAnswerToStudentQuestion(text.trim(), c.curriculumContext);
    setQuestionSuggestion(q.id, suggestion);
    return NextResponse.json({ question: q, suggestion });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit question" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }
  const questions = getStudentQuestionsByClass(classId);
  return NextResponse.json(questions);
}
