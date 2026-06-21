import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { StoredMemory } from "@/lib/memory/memory-adapter";

export const HISTORICAL_SNAPSHOT_SYSTEM = `You are reconstructing how a football-fan AI clone would have understood its user on a specific historical day.
You only know memories and predictions that existed on or before that day — nothing from the future.
Summarize what the clone genuinely knew, what it was still guessing, and how confident it should have been.
Be specific: cite team names, prediction counts, and contradictions when evidence exists.
Do not invent memories or matches that are not in the provided lists.`;

export function buildHistoricalSnapshotPrompt(input: {
  day: number;
  cutoffIso: string;
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style" | "summary"
  > | null;
  memories: StoredMemory[];
  predictions: PredictionHistoryItem[];
  walrusNamespace?: string;
}): string {
  const memoryBlock =
    input.memories.length > 0
      ? input.memories
          .map(
            (m, i) =>
              `${i + 1}. [${m.createdAt}] (${m.type}) ${m.text}${
                typeof m.metadata?.walrusBlobId === "string"
                  ? ` [blob:${m.metadata.walrusBlobId.slice(0, 12)}…]`
                  : ""
              }`,
          )
          .join("\n")
      : "No Walrus-backed memories yet.";

  const predictionBlock =
    input.predictions.length > 0
      ? input.predictions
          .map(
            (p) =>
              `- ${p.match.homeTeam?.name ?? "?"} vs ${p.match.awayTeam?.name ?? "?"}: ${p.prediction.winner} ${p.prediction.homeScore}-${p.prediction.awayScore} (${p.savedAt})`,
          )
          .join("\n")
      : "No predictions saved yet.";

  return `Historical reconstruction target: Day ${input.day} (cutoff ${input.cutoffIso})
Walrus namespace: ${input.walrusNamespace ?? "unknown"}

Profile summary: ${input.profile?.summary ?? "Unknown fan"}
Favorite team: ${input.profile?.favorite_team ?? "unknown"}
Rival team: ${input.profile?.rival_team ?? "unknown"}
Prediction style: ${input.profile?.preferred_style ?? "unknown"}

Memories available on or before Day ${input.day} (${input.memories.length} total):
${memoryBlock}

Predictions available on or before Day ${input.day} (${input.predictions.length} total):
${predictionBlock}

Return JSON with:
- reflection: 2-3 sentence first-person clone monologue as it would sound on that day
- bullets: 3-5 short knowledge bullets (what the clone knew / didn't know)
- confidence: integer 0-99 for how well the clone knew the user`;
}
