import type { ClonePredictionOutput } from "@/lib/llm/schemas/clone-prediction";
import { pickInfluentialReceiptsForFallback } from "@/lib/clone/clone-memory-receipts";
import type { RecalledMemory } from "@/lib/clone/recall-memories";
import type { Match } from "@/lib/mock/types";

const WEAK_MEMORY_QUESTION =
  "Who is your favorite team and why? I need a few real takes before I can clone you properly.";

function teamMatchesName(teamName: string, needle: string): boolean {
  const name = teamName.toLowerCase();
  const n = needle.toLowerCase();
  return name.includes(n) || n.includes(name.slice(0, 4));
}

export function fallbackClonePrediction(input: {
  match: Match;
  recalledMemories: RecalledMemory[];
  memoriesCount: number;
  favoriteTeam?: string | null;
  rivalTeam?: string | null;
}): ClonePredictionOutput {
  const { match, recalledMemories, memoriesCount } = input;

  if (!match.homeTeam || !match.awayTeam) {
    throw new Error("Match teams required");
  }

  const homeCode = match.homeTeam.code;
  const awayCode = match.awayTeam.code;
  const fav = input.favoriteTeam?.toLowerCase() ?? "";
  const rival = input.rivalTeam?.toLowerCase() ?? "";
  const homeName = match.homeTeam.name;
  const awayName = match.awayTeam.name;

  if (memoriesCount < 3) {
    let winner = homeCode;
    let homeScore = 1;
    let awayScore = 1;

    if (fav && teamMatchesName(homeName, fav)) {
      winner = homeCode;
      homeScore = 2;
      awayScore = 1;
    } else if (fav && teamMatchesName(awayName, fav)) {
      winner = awayCode;
      homeScore = 1;
      awayScore = 2;
    }

    return {
      predictedWinner: winner,
      predictedScore: { teamA: homeScore, teamB: awayScore },
      confidence: 25,
      reasoning:
        "I do not know your football instincts yet. My memory is too thin to clone you properly.",
      memoryReceipts: [],
      trainingQuestion: WEAK_MEMORY_QUESTION,
    };
  }

  let winner = homeCode;
  let homeScore = 2;
  let awayScore = 1;

  if (rival && teamMatchesName(homeName, rival)) {
    winner = awayCode;
    homeScore = 1;
    awayScore = 2;
  } else if (rival && teamMatchesName(awayName, rival)) {
    winner = homeCode;
    homeScore = 2;
    awayScore = 1;
  } else if (fav && teamMatchesName(homeName, fav)) {
    winner = homeCode;
    homeScore = 2;
    awayScore = 1;
  } else if (fav && teamMatchesName(awayName, fav)) {
    winner = awayCode;
    homeScore = 1;
    awayScore = 2;
  }

  const receipts = pickInfluentialReceiptsForFallback(recalledMemories, match, {
    favoriteTeam: input.favoriteTeam,
    rivalTeam: input.rivalTeam,
  });

  return {
    predictedWinner: winner,
    predictedScore: { teamA: homeScore, teamB: awayScore },
    confidence: receipts.length > 0 ? 58 : 45,
    reasoning: receipts[0]
      ? `Based on your pattern: ${receipts[0].summary}`
      : "Picking from profile biases only — no strong memory receipts for this matchup.",
    memoryReceipts: receipts,
    trainingQuestion: null,
  };
}
