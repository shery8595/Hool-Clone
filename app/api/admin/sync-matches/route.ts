import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/env";
import { syncMatchResultsFromApi } from "@/lib/match-data/sync-match-results";

function isAuthorized(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const secret = getCronSecret();
  if (!secret) return false;

  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}` || auth === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncMatchResultsFromApi();
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/admin/sync-matches", error);
    const message =
      error instanceof Error ? error.message : "Failed to sync matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
