import { NextRequest, NextResponse } from "next/server";
import { getStudentQuestionsByClass, getExitTicketsByClass } from "@/lib/store";
import { summarizeKidConcerns } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { classId } = await req.json();
    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 });
    }
    const questions = getStudentQuestionsByClass(classId);
    const tickets = getExitTicketsByClass(classId);
    const questionsForSummary = questions.map((q) => ({ studentName: q.studentName, text: q.text }));
    const ticketsForSummary = tickets.map((t) => ({
      studentName: t.studentName,
      feedback: t.feedback,
      whatLearned: t.whatLearned,
    }));
    const summary = await summarizeKidConcerns(questionsForSummary, ticketsForSummary);
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to summarize kid concerns" }, { status: 500 });
  }
}
