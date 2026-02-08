import { NextRequest, NextResponse } from "next/server";
import { getReleasedQuestions } from "@/lib/store";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }
  const questions = getReleasedQuestions(classId);
  return NextResponse.json(questions);
}
