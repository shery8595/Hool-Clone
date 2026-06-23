import type { Match } from "@/lib/mock/types";
import { teamMatchesRef } from "@/lib/clone/team-matching";

export function normalizeCloneWinner(
  predictedWinner: string,
  match: Match,
  fallbackWinner?: string | null,
): string {
  if (!match.homeTeam || !match.awayTeam) {
    throw new Error("Match teams required");
  }

  const homeCode = match.homeTeam.code;
  const awayCode = match.awayTeam.code;
  const trimmed = predictedWinner.trim();
  const upper = trimmed.toUpperCase();

  if (upper === homeCode.toUpperCase() || upper === awayCode.toUpperCase()) {
    return upper === homeCode.toUpperCase() ? homeCode : awayCode;
  }

  const lower = trimmed.toLowerCase();
  if (teamMatchesRef(match.homeTeam, trimmed) || lower.includes("home")) {
    return homeCode;
  }
  if (teamMatchesRef(match.awayTeam, trimmed) || lower.includes("away")) {
    return awayCode;
  }

  if (fallbackWinner === homeCode || fallbackWinner === awayCode) {
    return fallbackWinner;
  }

  return homeCode;
}
