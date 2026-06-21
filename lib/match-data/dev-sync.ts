import { syncMatchResultsFromApi } from "@/lib/match-data/sync-match-results";

const DEV_SYNC_INTERVAL_MS = 60_000;

let lastDevSyncAt = 0;
let devSyncInFlight: Promise<void> | null = null;

/** Pull live scores from worldcup26.ir in development (replaces Vercel cron locally). */
export async function maybeSyncMatchResultsInDev(): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;

  const now = Date.now();
  if (now - lastDevSyncAt < DEV_SYNC_INTERVAL_MS) return;

  if (devSyncInFlight) {
    await devSyncInFlight;
    return;
  }

  devSyncInFlight = (async () => {
    try {
      await syncMatchResultsFromApi();
      lastDevSyncAt = Date.now();
    } catch (error) {
      console.error("[dev] match sync failed", error);
    } finally {
      devSyncInFlight = null;
    }
  })();

  await devSyncInFlight;
}
