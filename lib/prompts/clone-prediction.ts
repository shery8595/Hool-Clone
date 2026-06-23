import type { DriverChip, Match } from "@/lib/mock/types";
import type { MemoryBackedPrior } from "@/lib/clone/memory-backed-winner";

export const CLONE_PREDICTION_SYSTEM = `You are HoolClone, an AI clone of this user's World Cup prediction personality.
You are predicting BEFORE the user reveals their pick for this specific match — you only know their profile and recalled memories, not their answer for this fixture.
Use recalled memories to imitate the user's habitual prediction behavior, not a guess at what they will pick today.
When memory is weak, say so and ask one useful training question in trainingQuestion.
When memory is strong, cite specific memory receipts from the recalled list only — do not fabricate memory IDs.
predictedWinner must be one of the two team codes provided.
predictedScore.teamA is the home team score; predictedScore.teamB is the away team score.
Return 2-4 memoryReceipts only for memories that materially shaped your predicted winner or score — not every recalled memory. Do not claim certainty you do not have.
Corrections override stale disputed memories. Recent prediction and post-match memories reflect current form. Fan profile memories are stable identity signals.
If a memory-backed prior is provided and conflicts with weak or generic memories, follow the prior unless a correction explicitly argues the other way.`;

export function buildClonePredictionPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  preferredStyle: string | null;
  onboardingDrivers?: DriverChip[];
  memoryPrior?: MemoryBackedPrior | null;
  contradictionSnippet?: string | null;
  match: Match;
  recalledMemories: Array<{
    id?: string;
    text: string;
    type?: string;
    score?: number;
    source?: string;
  }>;
  memoriesCount: number;
  postMatchMemoryCount?: number;
  cloneMoodLabel?: string;
  cloneMoodGuidance?: string;
}): string {
  const { match, recalledMemories, memoriesCount } = input;

  if (!match.homeTeam || !match.awayTeam) {
    throw new Error("Match teams required");
  }

  const memoryBlock =
    recalledMemories.length > 0
      ? recalledMemories
          .map((m, i) => {
            const score =
              m.score != null ? ` score=${m.score.toFixed(3)}` : "";
            const source = m.source ? ` source=${m.source}` : "";
            return `${i + 1}. [${m.id ?? "unknown"}] (${m.type ?? "memory"}${source}${score}) ${m.text}`;
          })
          .join("\n")
      : "No strong memories recalled yet.";

  const driversLine =
    input.onboardingDrivers && input.onboardingDrivers.length > 0
      ? input.onboardingDrivers.join(", ")
      : "none recorded";

  const priorBlock =
    input.memoryPrior &&
    input.memoryPrior.winner &&
    input.memoryPrior.confidence !== "none"
      ? `Memory-backed prior: backs ${input.memoryPrior.winner} (${input.memoryPrior.confidence}) — ${input.memoryPrior.reason}${
          input.memoryPrior.excerpt
            ? ` — "${input.memoryPrior.excerpt}"`
            : ""
        }${
          input.memoryPrior.supportingMemoryIds[0]
            ? ` [${input.memoryPrior.supportingMemoryIds[0]}]`
            : ""
        }`
      : "Memory-backed prior: none — infer from recalled memories.";

  const contradictionBlock = input.contradictionSnippet
    ? `Watch for contradiction: ${input.contradictionSnippet}`
    : "";

  return `Profile summary: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
Rival / distrusted team: ${input.rivalTeam ?? "unknown"}
Prediction style: ${input.preferredStyle ?? "unknown"}
Onboarding drivers: ${driversLine}
Total stored memories: ${memoriesCount}
Post-match memories on record: ${input.postMatchMemoryCount ?? 0}
Clone mood: ${input.cloneMoodLabel ?? "Learning"}
Tone guidance: ${input.cloneMoodGuidance ?? "Curious and observational."}
${priorBlock}
${contradictionBlock ? `${contradictionBlock}\n` : ""}
Match: ${match.homeTeam.name} (${match.homeTeam.code}) vs ${match.awayTeam.name} (${match.awayTeam.code})
Stage: ${match.stage}
Venue: ${match.venue}, ${match.city}
Kickoff: ${match.kickoffAt}

Recalled memories (ranked; you have NOT seen the user's pick for this match):
${memoryBlock}

Weighting guidance:
- correction memories are high-signal for current behavior
- prediction_submit memories from OTHER fixtures show habitual picks — never this match's saved pick
- only cite a memory from another fixture if it mentions ${match.homeTeam.name} or ${match.awayTeam.name}
- prediction_history_summary and match_resolution memories reflect how the user reacts after results
- fan_profile memories are long-term identity, not necessarily match-specific

Predict as this user would based on habits and biases alone. Use team codes ${match.homeTeam.code} and ${match.awayTeam.code} for predictedWinner.`;
}
