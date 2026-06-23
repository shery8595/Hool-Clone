import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/env";
import { processMemoryConsolidation } from "@/lib/memory/consolidate-memories";

/** Production: triggered every 6 hours by cron-job.org with Authorization: Bearer CRON_SECRET */

let cronInFlight: Promise<NextResponse> | null = null;

function isAuthorized(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}` || auth === secret;
}

async function runCron(): Promise<NextResponse> {
  try {
    const result = await processMemoryConsolidation();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/cron/memory-consolidation failed", error);
    return NextResponse.json(
      { error: "Memory consolidation cron failed", detail: message },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (cronInFlight) {
    return NextResponse.json({
      skipped: true,
      reason: "previous run still in progress",
    });
  }

  cronInFlight = runCron().finally(() => {
    cronInFlight = null;
  });

  return cronInFlight;
}
