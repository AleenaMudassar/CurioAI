import { NextRequest, NextResponse } from "next/server";
import { getAnswersByQuestion, getAnswersByClass } from "@/lib/store";

export async function GET(req: NextRequest) {
  const questionId = req.nextUrl.searchParams.get("questionId");
  const classId = req.nextUrl.searchParams.get("classId");
  if (questionId) {
    const answers = getAnswersByQuestion(questionId);
    return NextResponse.json(answers);
  }
  if (classId) {
    const answers = getAnswersByClass(classId);
    return NextResponse.json(answers);
  }
  return NextResponse.json({ error: "questionId or classId required" }, { status: 400 });
}
