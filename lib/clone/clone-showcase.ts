import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import type { ClonePredictionEntry } from "@/lib/db/clone-predictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import type { Match, Team } from "@/lib/mock/types";

export function formatClonePick(
  winner: string,
  homeScore: number,
  awayScore: number,
  home: Team,
  away: Team,
): string {
  const winnerName = winner === home.code ? home.name : away.name;
  return `${homeScore}-${awayScore} ${winnerName}`;
}

export function toRecalledMemories(memories: StoredMemory[]) {
  return memories.map((m) => ({
    id: m.id,
    text: m.text,
    type: m.type,
    score: 0.85,
  }));
}

export function pickShowcaseMatch(input: {
  history: PredictionHistoryItem[];
  cloneByMatchId: Map<string, ClonePredictionEntry>;
  matches: Match[];
}): {
  match: Match;
  cloneEntry: ClonePredictionEntry | null;
  historyItem: PredictionHistoryItem | null;
} | null {
  const playable = (m: Match) => m.homeTeam && m.awayTeam;

  for (const item of input.history) {
    if (!playable(item.match)) continue;
    const cloneEntry = input.cloneByMatchId.get(item.match.id);
    if (cloneEntry && !predictionsAgree(item.prediction, cloneEntry.clone)) {
      return { match: item.match, cloneEntry, historyItem: item };
    }
  }

  for (const item of input.history) {
    if (!playable(item.match)) continue;
    const cloneEntry = input.cloneByMatchId.get(item.match.id);
    if (cloneEntry) {
      return { match: item.match, cloneEntry, historyItem: item };
    }
  }

  const featured =
    input.matches.find((m) => m.featured && playable(m)) ??
    input.matches.find(playable);
  if (!featured) return null;

  return {
    match: featured,
    cloneEntry: input.cloneByMatchId.get(featured.id) ?? null,
    historyItem: null,
  };
}
