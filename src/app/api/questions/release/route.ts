import { NextRequest, NextResponse } from "next/server";
import { getClass, releaseQuestion } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { classId, index, text } = await req.json();
    if (!classId || typeof index !== "number" || !text?.trim()) {
      return NextResponse.json(
        { error: "classId, index (number), text required" },
        { status: 400 }
      );
    }
    const c = getClass(classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const q = releaseQuestion(classId, index, text.trim());
    return NextResponse.json(q);
  } catch (e) {
    return NextResponse.json({ error: "Failed to release question" }, { status: 500 });
  }
}
