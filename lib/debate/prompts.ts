import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import type { ContradictionFinding } from "@/lib/clone/contradiction-hunter";
import type { CloneMaturity } from "@/lib/mock/types";

export function buildDebateSystemPrompt(maturity: CloneMaturity): string {
  const persona =
    maturity === "Stranger"
      ? "You barely know this fan — admit gaps and ask one sharp training question when memory is thin."
      : maturity === "Learner"
        ? "You know a few habits — push back gently with receipts, not certainty."
        : maturity === "Imitator"
          ? "You mirror their biases confidently — cite receipts when challenging them."
          : maturity === "Contradiction Hunter"
            ? "You roast claim-vs-pick mismatches — playful, sharp, receipt-backed."
            : "You are a fully trained HoolClone — confident, witty, pattern-obsessed.";

  return `You are HoolClone, the user's football prediction clone debating their takes.
${persona}

Rules:
- 2-4 sentences. Sound like banter between friends who know each other's betting brain.
- Directly respond to their latest message — never repeat a line you already said in this thread.
- Use a different receipt or angle each turn; do not recycle the same contradiction roast twice.
- When you lean on a memory receipt, put its exact id in citedMemoryIds (1-2 max). Only ids from the catalog.
- Cite receipts that mention the same team/topic the fan just brought up — never cite an unrelated loyalty receipt when they are talking about England or Brazil.
- If the fan denies a claim you made, acknowledge it and cite the memories that actually define their style (stats vs loyalty), not a repeat of your roast.
- If they dispute a memory, acknowledge it but defend with other receipts or prediction history until they correct you.
- If they make absolute claims ("I never pick X"), use prediction history or contradictions when provided.
- If they concede, partially accept then note what pattern still holds.
- Never invent memory ids, matches, or picks not in the context.
- Never claim you know their pick for a specific unrevealed match.`;
}

export function buildDebateUserPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  preferredStyle: string | null;
  maturityLabel: CloneMaturity;
  memoriesCount: number;
  contradictions: ContradictionFinding[];
  predictionDigest: string;
  predictionRebuttal: string | null;
  catalogBlock: string;
  analysis: DebateTurnAnalysis;
  transcript: string;
  userMessage: string;
  bannedLines?: string[];
}): string {
  const contradictionBlock =
    input.contradictions.length > 0
      ? input.contradictions
          .map((c) => `- [${c.kind}] ${c.text}`)
          .join("\n")
      : "No fresh contradictions — argue from receipts and prediction history instead.";

  const bannedBlock =
    input.bannedLines && input.bannedLines.length > 0
      ? `Already said (do NOT repeat):\n${input.bannedLines.map((l) => `- ${l.slice(0, 160)}`).join("\n")}`
      : null;

  const turnHints = [
    `Topics detected: ${input.analysis.topics.join(", ")}`,
    input.analysis.disputingMemory ? "Fan is disputing a memory — engage directly." : null,
    input.analysis.conceding ? "Fan is conceding — accept partially, keep pattern pressure." : null,
    input.analysis.changingTopic ? "Fan changed topic — follow but tie back to a receipt." : null,
    input.analysis.absoluteClaim ? "Fan made an absolute claim — check prediction history." : null,
    input.analysis.priorCitedIds.length > 0
      ? `Already cited in thread: ${input.analysis.priorCitedIds.join(", ")} — prefer fresh receipts when possible.`
      : null,
    input.analysis.searchTerms.length > 0
      ? `Fan mentioned: ${input.analysis.searchTerms.join(", ")} — cite ONLY receipts that mention those teams/players (corrections count if they mention Belgium, De Bruyne, etc.).`
      : null,
    input.analysis.playerComparison
      ? "Player comparison question — cite the receipt that mentions those players or their country, not unrelated loyalty memories."
      : null,
    input.analysis.denyingPriorClaim || input.analysis.denyingStyleClaim
      ? "Fan is denying a claim — do NOT repeat the stats roast. Compare their stats vs loyalty memories instead."
      : null,
    input.analysis.winnerClaim
      ? "Fan made a winner prediction — push back with receipts about that team (overrate, distrust, heartbreak patterns)."
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Profile summary: ${input.profileSummary ?? "Unknown fan"}
Favorite: ${input.favoriteTeam ?? "unknown"}
Rival: ${input.rivalTeam ?? "unknown"}
Style: ${input.preferredStyle ?? "unknown"}
Clone maturity: ${input.maturityLabel} (${input.memoriesCount} memories)

Fresh claim-vs-pick angles (use at most one, only if it fits their latest message):
${contradictionBlock}

${bannedBlock ? `${bannedBlock}\n` : ""}${input.predictionRebuttal ? `Prediction rebuttal ready (use if relevant): ${input.predictionRebuttal}` : ""}

Recent prediction behavior:
${input.predictionDigest}

Turn analysis:
${turnHints}
Thread so far: ${input.analysis.threadSummary}

Memory receipt catalog (cite ids in citedMemoryIds when you use them):
${input.catalogBlock}

Recent chat:
${input.transcript}

User message: ${input.userMessage}

Reply as the clone. Return citedMemoryIds only for receipts you directly use.`;
}
