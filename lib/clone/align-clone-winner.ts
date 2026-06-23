import type { MemoryBackedPrior } from "@/lib/clone/memory-backed-winner";

export type AlignCloneWinnerResult = {
  winner: string;
  adjusted: boolean;
  reasoningNote: string | null;
};

export function alignCloneWinnerToPrior(input: {
  llmWinner: string;
  prior: MemoryBackedPrior;
  citedMemoryIds: string[];
}): AlignCloneWinnerResult {
  const { llmWinner, prior, citedMemoryIds } = input;

  if (
    prior.confidence !== "strong" ||
    !prior.winner ||
    prior.winner === llmWinner
  ) {
    return { winner: llmWinner, adjusted: false, reasoningNote: null };
  }

  const citesSupporting = prior.supportingMemoryIds.some((id) =>
    citedMemoryIds.includes(id),
  );

  if (citesSupporting) {
    return { winner: llmWinner, adjusted: false, reasoningNote: null };
  }

  return {
    winner: prior.winner,
    adjusted: true,
    reasoningNote: "Adjusted to match your stored bias/correction.",
  };
}

export function nudgeScoresForWinner(
  winner: string,
  homeCode: string,
  awayCode: string,
  homeScore: number,
  awayScore: number,
): { homeScore: number; awayScore: number } {
  if (winner === homeCode && homeScore <= awayScore) {
    return { homeScore: awayScore + 1, awayScore };
  }
  if (winner === awayCode && awayScore <= homeScore) {
    return { homeScore, awayScore: homeScore + 1 };
  }
  return { homeScore, awayScore };
}
