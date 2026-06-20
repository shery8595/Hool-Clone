import type { Prediction } from "./types";
import { memories } from "./memories";

/** Demo predictions tied to official schedule match IDs (m066, m071) */
export const predictions: Prediction[] = [
  {
    matchId: "m071",
    winner: "POR",
    homeScore: 2,
    awayScore: 1,
    confidence: 78,
    reasoning: "Portugal's late-game brilliance in knockouts.",
    emotion: "hyped",
    agreed: true,
    clone: {
      winner: "POR",
      homeScore: 2,
      awayScore: 1,
      confidence: 72,
      reasoning:
        "Based on your pattern of trusting emotional favorites with star attackers in close knockout matches.",
      receipts: memories.filter((m) =>
        ["mem-1", "mem-2"].includes(m.id),
      ),
    },
  },
  {
    matchId: "m066",
    winner: "URU",
    homeScore: 2,
    awayScore: 1,
    confidence: 65,
    reasoning: "Uruguay's experience in tight knockout games.",
    emotion: "hyped",
    agreed: false,
    clone: {
      winner: "ESP",
      homeScore: 2,
      awayScore: 1,
      confidence: 68,
      reasoning:
        "I think you'd pick Spain because you trust possession-heavy favorites — even when you say you back the underdog story.",
      insight: "Your clone thinks you are bluffing with Uruguay.",
      receipts: memories.filter((m) =>
        ["mem-4", "mem-5", "mem-6"].includes(m.id),
      ),
    },
  },
];

export function getPrediction(matchId: string): Prediction | undefined {
  return predictions.find((p) => p.matchId === matchId);
}

export function getLatestComparison(): Prediction {
  return predictions[0];
}
