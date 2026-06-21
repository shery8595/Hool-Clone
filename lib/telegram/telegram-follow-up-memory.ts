import type { CitedMemoryPayload } from "@/lib/telegram/citation-enforcement";

function primaryCitationSnippet(citedMemories: CitedMemoryPayload[]): string | null {
  const top = citedMemories[0]?.text?.trim();
  if (!top) return null;
  const cleaned = top.replace(/^\[[^\]]+\]\s*/, "").trim();
  if (cleaned.length <= 100) return cleaned;
  return `${cleaned.slice(0, 100)}…`;
}

export function buildLiveGoalFollowUpMemoryText(input: {
  matchLabel: string;
  scoringTeam: string | null;
  situation: string;
  citedMemories: CitedMemoryPayload[];
}): string {
  const scorer = input.scoringTeam ?? "unknown side";
  const memoryLine = primaryCitationSnippet(input.citedMemories);
  const anchor = memoryLine
    ? `Earlier take recalled: "${memoryLine}".`
    : "No strong prior memory cited.";
  return `[live_goal] ${input.matchLabel}: ${scorer} scored (${input.situation}). ${anchor}`;
}

export function buildPostMatchFollowUpMemoryText(input: {
  matchLabel: string;
  predictedWinner: string | null;
  actualWinner: string;
  outcome: "win" | "loss";
  citedMemories: CitedMemoryPayload[];
}): string {
  const pick = input.predictedWinner ?? "no pick";
  const memoryLine = primaryCitationSnippet(input.citedMemories);
  const anchor = memoryLine
    ? `Recalled belief: "${memoryLine}".`
    : "Clone had thin memory context.";
  return `[post_match] ${input.matchLabel}: predicted ${pick}, winner ${input.actualWinner}. Outcome: ${input.outcome}. ${anchor}`;
}
