import { NextRequest, NextResponse } from "next/server";
import { createClass, getClassByCode } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { teacherName } = await req.json();
    if (!teacherName?.trim()) {
      return NextResponse.json({ error: "teacherName required" }, { status: 400 });
    }
    const session = createClass(teacherName.trim());
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("code");
  const code = raw?.trim().toUpperCase() ?? "";
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }
  const session = getClassByCode(code);
  if (!session) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}
