import { NextResponse } from "next/server";
import { seedMatches } from "@/lib/db/seed-matches";
import { getEnv } from "@/lib/env";

function isSeedAllowed(request: Request): boolean {
  const env = getEnv();
  if (env.NODE_ENV === "development") return true;

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const header = request.headers.get("x-admin-secret");
  return header === secret;
}

export async function POST(request: Request) {
  if (!isSeedAllowed(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await seedMatches();
    return NextResponse.json({
      ok: true,
      inserted: result.inserted,
      total: result.total,
    });
  } catch (error) {
    console.error("POST /api/admin/seed-matches", error);
    const message =
      error instanceof Error ? error.message : "Failed to seed matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
