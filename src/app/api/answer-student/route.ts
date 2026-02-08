import { NextRequest, NextResponse } from "next/server";
import { getClass, getStudentQuestion, setAiAnswer } from "@/lib/store";
import { answerStudentAsAI } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { questionId } = await req.json();
    if (!questionId) {
      return NextResponse.json({ error: "questionId required" }, { status: 400 });
    }
    const q = getStudentQuestion(questionId);
    if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });
    const c = getClass(q.classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const answer = await answerStudentAsAI(q.text, c.curriculumContext);
    setAiAnswer(questionId, answer);
    return NextResponse.json({ answer });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    const isQuota =
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("rate limit");
    const isApiKey =
      message.includes("API_KEY") ||
      message.includes("401") ||
      message.toLowerCase().includes("invalid") && message.toLowerCase().includes("key");
    if (isQuota) {
      return NextResponse.json(
        { error: "Gemini rate limit reached (out of tokens or requests). Wait a minute and try again, or use a new API key at https://aistudio.google.com/apikey" },
        { status: 429 }
      );
    }
    if (isApiKey) {
      return NextResponse.json(
        { error: "Gemini API key missing or invalid. Add GEMINI_API_KEY to .env.local (get a key at https://aistudio.google.com/apikey)" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: message && message.length < 200 ? message : "Failed to generate answer. Try again or ask your teacher." },
      { status: 500 }
    );
  }
}
