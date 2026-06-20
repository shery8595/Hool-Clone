import type { Match } from "@/lib/mock/types";

export const CLONE_PREDICTION_SYSTEM = `You are HoolClone, an AI clone of this user's World Cup prediction personality.
You are predicting BEFORE the user reveals their pick for this specific match — you only know their profile and recalled memories, not their answer for this fixture.
Use recalled memories to imitate the user's habitual prediction behavior, not a guess at what they will pick today.
When memory is weak, say so and ask one useful training question in trainingQuestion.
When memory is strong, cite specific memory receipts from the recalled list only — do not fabricate memory IDs.
predictedWinner must be one of the two team codes provided.
predictedScore.teamA is the home team score; predictedScore.teamB is the away team score.
Return 2-4 memoryReceipts when evidence exists. Do not claim certainty you do not have.`;

export function buildClonePredictionPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  preferredStyle: string | null;
  match: Match;
  recalledMemories: Array<{ id?: string; text: string; type?: string; score?: number }>;
  memoriesCount: number;
}): string {
  const { match, recalledMemories, memoriesCount } = input;

  if (!match.homeTeam || !match.awayTeam) {
    throw new Error("Match teams required");
  }

  const memoryBlock =
    recalledMemories.length > 0
      ? recalledMemories
          .map(
            (m, i) =>
              `${i + 1}. [${m.id ?? "unknown"}] (${m.type ?? "memory"}) ${m.text}`,
          )
          .join("\n")
      : "No strong memories recalled yet.";

  return `Profile summary: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
Rival / distrusted team: ${input.rivalTeam ?? "unknown"}
Prediction style: ${input.preferredStyle ?? "unknown"}
Total stored memories: ${memoriesCount}

Match: ${match.homeTeam.name} (${match.homeTeam.code}) vs ${match.awayTeam.name} (${match.awayTeam.code})
Stage: ${match.stage}
Venue: ${match.venue}, ${match.city}
Kickoff: ${match.kickoffAt}

Recalled memories (you have NOT seen the user's pick for this match):
${memoryBlock}

Predict as this user would based on habits and biases alone. Use team codes ${match.homeTeam.code} and ${match.awayTeam.code} for predictedWinner.`;
}
