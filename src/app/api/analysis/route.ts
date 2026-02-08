import { NextRequest, NextResponse } from "next/server";
import { getAnswerAnalysis } from "@/lib/store";

export async function GET(req: NextRequest) {
  const questionId = req.nextUrl.searchParams.get("questionId");
  if (!questionId) {
    return NextResponse.json({ error: "questionId required" }, { status: 400 });
  }
  const analysis = getAnswerAnalysis(questionId);
  if (!analysis) {
    return NextResponse.json({ error: "No analysis yet" }, { status: 404 });
  }
  return NextResponse.json(analysis);
}
