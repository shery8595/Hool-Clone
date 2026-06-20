import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/env";
import { processPostLossRoasts } from "@/lib/telegram/post-loss-roast";

function isAuthorized(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}` || auth === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processPostLossRoasts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/cron/check-resolutions", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
