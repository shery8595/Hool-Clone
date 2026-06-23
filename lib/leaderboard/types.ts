import type { CloneMaturity } from "@/lib/mock/types";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  slug: string;
  displayName: string;
  maturityLabel: CloneMaturity;
  tierProgress: number;
  memoriesCount: number;
  cloneAgreementCount: number;
  comparablePredictions: number;
  cloneMatchPercent: number;
  learningScore: number;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  joinedAt: string;
  arenaWins: number;
  arenaLosses: number;
  arenaDraws: number;
};

export type LeaderboardData = {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  viewerEntry: LeaderboardEntry | null;
};
