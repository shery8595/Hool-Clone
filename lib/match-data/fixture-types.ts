import type { MatchStatus } from "@/lib/mock/types";

/** Normalized fixture shape for match sync (provider-agnostic). */
export type NormalizedFixture = {
  providerId: string;
  matchNumber: number | null;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: MatchStatus;
  homeGoals: number | null;
  awayGoals: number | null;
  timeElapsed: string | null;
  finished: boolean;
};
