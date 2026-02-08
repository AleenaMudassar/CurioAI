import { NextRequest, NextResponse } from "next/server";
import { setTeacherAnswer } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { questionId, answer } = await req.json();
    if (!questionId || !answer?.trim()) {
      return NextResponse.json({ error: "questionId and answer required" }, { status: 400 });
    }
    setTeacherAnswer(questionId, answer.trim());
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
