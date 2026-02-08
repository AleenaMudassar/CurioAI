import { NextRequest, NextResponse } from "next/server";
import { getClass } from "@/lib/store";
import { detectConfusionAndRephrase } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { classId, text } = await req.json();
    if (!classId || !text?.trim()) {
      return NextResponse.json({ error: "classId and text required" }, { status: 400 });
    }
    const c = getClass(classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const context = c.curriculumContext || c.lessonPlan || "";
    const result = await detectConfusionAndRephrase(text.trim(), context);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
