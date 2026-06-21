import { NextResponse } from "next/server";
import { processPostMatchResolutionMemories } from "@/lib/clone/post-match-resolution";
import { getCronSecret } from "@/lib/env";
import { syncMatchResultsFromApi } from "@/lib/match-data/sync-match-results";
import { processLiveGoalNotifications } from "@/lib/telegram/live-goal-notify";
import { processPostMatchNotifications } from "@/lib/telegram/post-match-notify";

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
    const syncResult = await syncMatchResultsFromApi();
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
    console.error("GET /api/cron/check-resolutions", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
