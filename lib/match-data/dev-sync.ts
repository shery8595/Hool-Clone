import { syncMatchResultsFromApi } from "@/lib/match-data/sync-match-results";

/** @deprecated Use maybeSyncMatchResultsOnRead from match-sync-on-read.ts */
export { maybeSyncMatchResultsOnRead as maybeSyncMatchResultsInDev } from "@/lib/match-data/match-sync-on-read";

export async function forceSyncMatchResults(): Promise<void> {
  await syncMatchResultsFromApi();
}
