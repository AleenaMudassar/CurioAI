import { NextRequest, NextResponse } from "next/server";
import { getClass } from "@/lib/store";
import { teacherChat } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { classId, message } = await req.json();
    if (!classId || !message?.trim()) {
      return NextResponse.json({ error: "classId and message required" }, { status: 400 });
    }
    const c = getClass(classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const context = c.curriculumContext || c.lessonPlan || "No curriculum uploaded yet.";
    const response = await teacherChat(message.trim(), context);
    return NextResponse.json({ response });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
