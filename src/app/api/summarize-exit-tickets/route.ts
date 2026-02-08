import { NextRequest, NextResponse } from "next/server";
import { getExitTicketsByClass, setExitTicketSummary } from "@/lib/store";
import { summarizeExitTickets, suggestNextLessonFromFeedback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { classId } = await req.json();
    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 });
    }
    const tickets = getExitTicketsByClass(classId);
    if (tickets.length === 0) {
      return NextResponse.json({ error: "No exit tickets to summarize" }, { status: 400 });
    }
    const feedbacks = tickets.map((t) => ({
      studentName: t.studentName,
      feedback: `${t.feedback}\nWhat I learned: ${t.whatLearned}`,
    }));
    const summary = await summarizeExitTickets(feedbacks);
    const suggestionsForNextLesson = await suggestNextLessonFromFeedback(summary);
    setExitTicketSummary(classId, summary, suggestionsForNextLesson);
    return NextResponse.json({ summary, suggestionsForNextLesson });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
