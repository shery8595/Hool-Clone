import type { PredictionHistoryItem } from "@/lib/db/predictions";

export function normalizeMatchId(id: string): string {
  return id.trim().toLowerCase();
}

export function buildPredictedMatchIdSet(
  history: PredictionHistoryItem[],
  extraIds: Iterable<string> = [],
): Set<string> {
  const ids = new Set<string>();

  for (const item of history) {
    ids.add(normalizeMatchId(item.prediction.matchId));
    ids.add(normalizeMatchId(item.match.id));
  }

  for (const id of extraIds) {
    if (id) ids.add(normalizeMatchId(id));
  }

  return ids;
}

export function hasPredictedMatch(
  predictedMatchIds: Set<string>,
  matchId: string,
): boolean {
  return predictedMatchIds.has(normalizeMatchId(matchId));
}
