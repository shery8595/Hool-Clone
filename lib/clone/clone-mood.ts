import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DriverChip } from "@/lib/mock/types";

export type CloneMoodId =
  | "on_fire"
  | "salty"
  | "loyalist"
  | "contradiction_hunter"
  | "neutral";

export type CloneMood = {
  id: CloneMoodId;
  label: string;
  description: string;
  toneGuidance: string;
};

function recentResolved(history: PredictionHistoryItem[], limit = 5) {
  return history
    .filter((item) => {
      const result = item.matchResult;
      return (
        result?.status === "final" &&
        result.winner != null &&
        item.prediction.winner != null
      );
    })
    .slice(0, limit)
    .map((item) => ({
      item,
      wasCorrect: item.prediction.winner === item.matchResult?.winner,
    }));
}

export function computeCloneMood(input: {
  history: PredictionHistoryItem[];
  memoryDrivers: DriverChip[];
  contradictionCount: number;
  favoriteTeam: string | null;
}): CloneMood {
  const recent = recentResolved(input.history);
  const wrong = recent.filter((entry) => !entry.wasCorrect).length;
  const right = recent.filter((entry) => entry.wasCorrect).length;
  const loyaltyHeavy =
    input.memoryDrivers.filter((d) => d === "loyalty").length >= 2;

  if (input.contradictionCount >= 2) {
    return {
      id: "contradiction_hunter",
      label: "Contradiction Hunter",
      description: `Your clone is roasting inconsistent takes (${input.contradictionCount} contradictions on file).`,
      toneGuidance:
        "Sharp, playful, call out contradictions between old memories and new picks.",
    };
  }

  if (wrong >= 2) {
    return {
      id: "salty",
      label: "Salty",
      description: `Clone mood: salty after ${wrong} wrong picks in recent memory.`,
      toneGuidance:
        "Dry, slightly sarcastic — you've been wrong lately and the clone remembers.",
    };
  }

  if (right >= 2) {
    return {
      id: "on_fire",
      label: "On Fire",
      description: `Clone mood: confident after ${right} correct picks recalled from Walrus.`,
      toneGuidance:
        "Bold and confident — recent wins are in memory and the clone is riding the streak.",
    };
  }

  if (loyaltyHeavy && input.favoriteTeam) {
    return {
      id: "loyalist",
      label: "Loyalist",
      description: `Clone mood: loyalty-first — backs ${input.favoriteTeam} from stored fan memories.`,
      toneGuidance:
        "Emotional, team-first — loyalty memories outweigh cold stats in tone.",
    };
  }

  return {
    id: "neutral",
    label: "Learning",
    description: "Clone mood: still learning your football brain from Walrus memories.",
    toneGuidance: "Curious and observational — cite memories without overconfidence.",
  };
}
