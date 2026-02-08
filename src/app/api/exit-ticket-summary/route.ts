import { NextRequest, NextResponse } from "next/server";
import { getExitTicketSummary } from "@/lib/store";

export async function GET(req: NextRequest) {
  const classId = req.nextUrl.searchParams.get("classId");
  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }
  const summary = getExitTicketSummary(classId);
  if (!summary) {
    return NextResponse.json({ error: "No summary yet" }, { status: 404 });
  }
  return NextResponse.json(summary);
}
