import { NextRequest, NextResponse } from "next/server";
import { getReleasedQuestion, getAnswersByQuestion, setAnswerAnalysis } from "@/lib/store";
import { analyzeStudentAnswers } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { questionId } = await req.json();
    if (!questionId) {
      return NextResponse.json({ error: "questionId required" }, { status: 400 });
    }
    const q = getReleasedQuestion(questionId);
    if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });
    const answers = getAnswersByQuestion(questionId);
    if (answers.length === 0) {
      return NextResponse.json({ error: "No answers to analyze" }, { status: 400 });
    }
    const summary = await analyzeStudentAnswers(
      q.text,
      answers.map((a) => ({ studentName: a.studentName, answer: a.answer }))
    );
    setAnswerAnalysis(questionId, q.text, summary);
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
