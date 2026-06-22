import { syncMatchResultsFromApi } from "@/lib/match-data/sync-match-results";

const SYNC_INTERVAL_MS = 45_000;

let lastSyncAt = 0;
let syncInFlight: Promise<void> | null = null;

/** Throttled score pull from worldcup26.ir before serving match lists (prod + dev). */
export async function maybeSyncMatchResultsOnRead(): Promise<void> {
  const now = Date.now();
  if (now - lastSyncAt < SYNC_INTERVAL_MS) return;

  if (syncInFlight) {
    await syncInFlight;
    return;
  }

  syncInFlight = (async () => {
    try {
      await syncMatchResultsFromApi();
      lastSyncAt = Date.now();
    } catch (error) {
      console.error("[match-sync] on-read sync failed", error);
    } finally {
      syncInFlight = null;
    }
  })();

  await syncInFlight;
}
