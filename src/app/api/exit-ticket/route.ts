import { NextRequest, NextResponse } from "next/server";
import { getClass, submitExitTicket, getExitTicketsByClass } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { classId, studentName, studentId, feedback, whatLearned } = await req.json();
    if (!classId || !studentName?.trim() || !studentId) {
      return NextResponse.json(
        { error: "classId, studentName, studentId required" },
        { status: 400 }
      );
    }
    const c = getClass(classId);
    if (!c) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    const t = submitExitTicket(
      classId,
      studentName.trim(),
      studentId,
      (feedback || "").trim(),
      (whatLearned || "").trim()
    );
    return NextResponse.json(t);
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit exit ticket" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }
  const tickets = getExitTicketsByClass(classId);
  return NextResponse.json(tickets);
}
