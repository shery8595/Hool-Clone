import { NextResponse } from "next/server";
import { processPostMatchResolutionMemories } from "@/lib/clone/post-match-resolution";
import { getCronSecret } from "@/lib/env";
import {
  syncMatchResultsFromApi,
  type MatchSyncResult,
} from "@/lib/match-data/sync-match-results";
import { processLiveGoalNotifications } from "@/lib/telegram/live-goal-notify";
import { processPostMatchNotifications } from "@/lib/telegram/post-match-notify";

/** Production: triggered every minute by cron-job.org with Authorization: Bearer CRON_SECRET */

let cronInFlight: Promise<NextResponse> | null = null;

function isAuthorized(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}` || auth === secret;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

async function runCron(): Promise<NextResponse> {
  let syncResult: MatchSyncResult;
  try {
    syncResult = await syncMatchResultsFromApi();
  } catch (error) {
    const message = errorMessage(error);
    console.error("GET /api/cron/check-resolutions sync failed", error);
    syncResult = {
      skipped: true,
      fixturesFetched: 0,
      matched: 0,
      updated: 0,
      liveGoalEvents: [],
      unmatched: [],
      syncError: message,
    };
  }

  try {
    const liveResult = await processLiveGoalNotifications(
      syncResult.liveGoalEvents,
    );
    const [telegramResult, resolutionResult] = await Promise.all([
      processPostMatchNotifications(),
      processPostMatchResolutionMemories(),
    ]);
    return NextResponse.json({
      sync: syncResult,
      live: liveResult,
      telegram: telegramResult,
      resolution: resolutionResult,
    });
  } catch (error) {
    const message = errorMessage(error);
    console.error("GET /api/cron/check-resolutions notify failed", error);
    return NextResponse.json(
      { error: "Cron failed", step: "notify", detail: message },
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
