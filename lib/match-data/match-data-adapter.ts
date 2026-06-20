import type { Match } from "@/lib/mock/types";

export interface MatchDataAdapter {
  listMatches(): Promise<Match[]>;
  getMatch(matchId: string): Promise<Match | null>;
}
