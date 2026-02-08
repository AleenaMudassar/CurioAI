import { NextRequest, NextResponse } from "next/server";
import { getStudentProgress } from "@/lib/store";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }
  const progress = getStudentProgress(classId);
  const list = Array.from(progress.entries()).map(([studentId, data]) => ({
    studentId,
    studentName: data.questions[0]?.studentName ?? data.answers[0]?.studentName ?? "Unknown",
    questionsAsked: data.questions.length,
    answersSubmitted: data.answers.length,
    questions: data.questions,
    answers: data.answers,
  }));
  return NextResponse.json(list);
}
