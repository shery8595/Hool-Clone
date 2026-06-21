import type { ClashParticipantMeta } from "@/lib/clash/types";
import type { Match } from "@/lib/mock/types";
import type { MemoryReceipt } from "@/lib/mock/types";

export const CLASH_DEBATE_SYSTEM = `You script a 3-turn football banter debate between two HoolClone agents.
Each agent represents a different fan and may ONLY cite memories from their own catalog.
Write like passionate World Cup fans arguing before a match — witty, specific, receipt-backed.
Rules:
- Exactly 6 turns total, alternating A then B (A, B, A, B, A, B).
- 2-4 sentences per turn.
- Each turn must include citedMemoryIds: 1-2 UUIDs from ONLY that speaker's catalog.
- Reference the actual match teams and the fans' loyalties.
- Never invent memory ids, teams, or scores not in context.
- Clones disagree on the likely winner — lean into contrasting biases.`;

function formatCatalog(
  label: string,
  receipts: MemoryReceipt[],
): string {
  if (receipts.length === 0) {
    return `${label} catalog: (no public memories recalled — argue from fan profile only)`;
  }
  return `${label} catalog:\n${receipts
    .map((r) => `- id:${r.id} | ${r.text.slice(0, 160)}`)
    .join("\n")}`;
}

export function buildClashDebateUserPrompt(input: {
  match: Match;
  participantA: ClashParticipantMeta;
  participantB: ClashParticipantMeta;
  receiptsA: MemoryReceipt[];
  receiptsB: MemoryReceipt[];
}): string {
  const home = input.match.homeTeam?.name ?? "TBD";
  const away = input.match.awayTeam?.name ?? "TBD";

  return `Match: ${home} vs ${away} (${input.match.stage})
Venue: ${input.match.venue}, ${input.match.city}

Fan A — ${input.participantA.displayName} (@${input.participantA.handle})
Maturity: ${input.participantA.maturityLabel}
Favorite: ${input.participantA.favoriteTeam ?? "unknown"}
Rival: ${input.participantA.rivalTeam ?? "unknown"}
Namespace: ${input.participantA.namespace}

Fan B — ${input.participantB.displayName} (@${input.participantB.handle})
Maturity: ${input.participantB.maturityLabel}
Favorite: ${input.participantB.favoriteTeam ?? "unknown"}
Rival: ${input.participantB.rivalTeam ?? "unknown"}
Namespace: ${input.participantB.namespace}

${formatCatalog("Fan A", input.receiptsA)}

${formatCatalog("Fan B", input.receiptsB)}

Script 6 alternating turns (A opens). Each clone argues as their fan would predict this match.`;
}
