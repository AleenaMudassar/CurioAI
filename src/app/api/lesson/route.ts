import { NextRequest, NextResponse } from "next/server";
import { getClass, updateLessonPlan, updateTeachingNotes } from "@/lib/store";
import { generateTeachingNotes } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { classId, lessonPlan } = await req.json();
    if (!classId || !lessonPlan?.trim()) {
      return NextResponse.json({ error: "classId and lessonPlan required" }, { status: 400 });
    }
    const c = getClass(classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    updateLessonPlan(classId, lessonPlan.trim());
    let teachingNotes: string;
    try {
      teachingNotes = await generateTeachingNotes(lessonPlan.trim());
    } catch (geminiError: unknown) {
      const msg = geminiError instanceof Error ? geminiError.message : String(geminiError);
      return NextResponse.json({
        error: msg.includes("API key") || msg.includes("API_KEY")
          ? "Invalid or missing GEMINI_API_KEY. Add it to .env.local and restart."
          : `AI error: ${msg}`,
      }, { status: 500 });
    }
    const curriculumContext = `${c.lessonPlan}\n\nTeaching notes:\n${teachingNotes}`;
    updateTeachingNotes(classId, teachingNotes, curriculumContext);
    const updated = getClass(classId);
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to generate teaching notes";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
