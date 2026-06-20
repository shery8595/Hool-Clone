import { NextResponse } from "next/server";
import { buildMeResponse } from "@/lib/db/users";
import { getSession, SESSION_COOKIE } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(null);
    }

    const me = await buildMeResponse(session.userId);
    if (!me) {
      return NextResponse.json(null);
    }

    return NextResponse.json(me);
  } catch (error) {
    console.error("GET /api/me", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
