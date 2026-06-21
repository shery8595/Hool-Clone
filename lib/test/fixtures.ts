import type { RecalledMemory } from "@/lib/clone/recall-memories";
import type { RankedMemory } from "@/lib/clone/memory-rerank";
import type { Match, MemoryReceipt, Team } from "@/lib/mock/types";
import { getMatch } from "@/lib/mock/matches";

export function makeTeam(
  code: string,
  name?: string,
  flag?: string,
): Team {
  return {
    code,
    name: name ?? code,
    flag: flag ?? code.toLowerCase(),
  };
}

export function makeMatch(overrides: Partial<Match> = {}): Match {
  const base = getMatch("m071") ?? {
    id: "m071",
    matchNumber: 71,
    stage: "Group Stage",
    homeTeam: makeTeam("BRA", "Brazil"),
    awayTeam: makeTeam("FRA", "France"),
    kickoffAt: "2026-06-15T20:00:00Z",
    venue: "MetLife Stadium",
    city: "East Rutherford",
    status: "final" as const,
    homeScore: 2,
    awayScore: 1,
    winnerCode: "BRA",
  };

  return { ...base, ...overrides };
}

export function makeReceipt(
  overrides: Partial<MemoryReceipt> & Pick<MemoryReceipt, "id" | "text">,
): MemoryReceipt {
  return {
    type: "remembered",
    date: "2026-06-01",
    publicVisible: true,
    ...overrides,
  };
}

export function makeRecalledMemory(
  overrides: Partial<RankedMemory> & Pick<RecalledMemory, "text">,
): RankedMemory {
  return {
    score: 0.7,
    rrfScore: 1,
    finalScore: 0.7,
    ...overrides,
  };
}
