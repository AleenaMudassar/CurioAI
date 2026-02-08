import { NextRequest, NextResponse } from "next/server";
import { getReleasedQuestion, submitQuestionAnswer } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { questionId, classId, studentName, studentId, answer } = await req.json();
    if (!questionId || !classId || !studentName?.trim() || !studentId || !answer?.trim()) {
      return NextResponse.json(
        { error: "questionId, classId, studentName, studentId, answer required" },
        { status: 400 }
      );
    }
    const q = getReleasedQuestion(questionId);
    if (!q || q.classId !== classId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    const a = submitQuestionAnswer(questionId, classId, studentName.trim(), studentId, answer.trim());
    return NextResponse.json(a);
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
