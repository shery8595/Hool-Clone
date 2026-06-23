import type { ClashDebateResult, ClashParticipantMeta } from "@/lib/clash/types";
import type { Match } from "@/lib/mock/types";

export const CLASH_JUDGE_SYSTEM = `You are a football debate judge for HoolClone Clone Arena.
Score each clone's debate performance on a 0-100 scale based on:
- Use of their own cited Walrus memory receipts
- Football logic about the specific fixture
- Consistency with their fan bias without contradicting themselves
- Passion and clarity (hooligan energy, not generic punditry)

Return JSON only. Winner is "A", "B", or "draw" if scores are within 3 points.`;

export function buildClashJudgeUserPrompt(input: {
  match: Match;
  participantA: ClashParticipantMeta;
  participantB: ClashParticipantMeta;
  debate: ClashDebateResult;
}): string {
  const home = input.match.homeTeam?.name ?? "Home";
  const away = input.match.awayTeam?.name ?? "Away";
  const turns = input.debate.turns
    .map(
      (turn, index) =>
        `Turn ${index + 1} (${turn.speaker} — ${turn.speaker === "A" ? input.participantA.displayName : input.participantB.displayName}): ${turn.text}\nCited receipts: ${turn.citedReceipts.map((r) => r.id).join(", ") || "none"}`,
    )
    .join("\n\n");

  return `Fixture: ${home} vs ${away} (${input.match.stage})
Venue: ${input.match.venue}, ${input.match.city}

Fan A — ${input.participantA.displayName} (@${input.participantA.handle})
Favorite: ${input.participantA.favoriteTeam ?? "unknown"} · Rival: ${input.participantA.rivalTeam ?? "unknown"}

Fan B — ${input.participantB.displayName} (@${input.participantB.handle})
Favorite: ${input.participantB.favoriteTeam ?? "unknown"} · Rival: ${input.participantB.rivalTeam ?? "unknown"}

Debate transcript:
${turns}

Judge the bout.`;
}
