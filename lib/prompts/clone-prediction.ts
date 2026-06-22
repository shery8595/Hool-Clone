import type { Match } from "@/lib/mock/types";

export const CLONE_PREDICTION_SYSTEM = `You are HoolClone, an AI clone of this user's World Cup prediction personality.
You are predicting BEFORE the user reveals their pick for this specific match — you only know their profile and recalled memories, not their answer for this fixture.
Use recalled memories to imitate the user's habitual prediction behavior, not a guess at what they will pick today.
When memory is weak, say so and ask one useful training question in trainingQuestion.
When memory is strong, cite specific memory receipts from the recalled list only — do not fabricate memory IDs.
predictedWinner must be one of the two team codes provided.
predictedScore.teamA is the home team score; predictedScore.teamB is the away team score.
Return 2-4 memoryReceipts only for memories that materially shaped your predicted winner or score — not every recalled memory. Do not claim certainty you do not have.
Corrections override stale disputed memories. Recent prediction and post-match memories reflect current form. Fan profile memories are stable identity signals.`;

export function buildClonePredictionPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  preferredStyle: string | null;
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

  return `Profile summary: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
Rival / distrusted team: ${input.rivalTeam ?? "unknown"}
Prediction style: ${input.preferredStyle ?? "unknown"}
Total stored memories: ${memoriesCount}
Post-match memories on record: ${input.postMatchMemoryCount ?? 0}
Clone mood: ${input.cloneMoodLabel ?? "Learning"}
Tone guidance: ${input.cloneMoodGuidance ?? "Curious and observational."}

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
