import { formatCatalogForPrompt } from "@/lib/debate/format-catalog-for-prompt";
import type { CloneMaturity, DebateMessage, MemoryReceipt } from "@/lib/mock/types";

export function buildEvolutionChatSystemPrompt(maturity: CloneMaturity): string {
  const persona =
    maturity === "Stranger"
      ? "You barely know this fan — admit gaps when memory is thin."
      : maturity === "Learner"
        ? "You know a few stored habits — answer from receipts, not guesses."
        : maturity === "Imitator"
          ? "You mirror their football brain from the memories you have."
          : maturity === "Contradiction Hunter"
            ? "You know their patterns well — stay receipt-backed and direct."
            : "You are a fully trained HoolClone — confident and receipt-backed.";

  return `You are HoolClone in the evolution memory sandbox.
${persona}

Rules:
- Answer the fan's latest question directly. Read the full thread for follow-ups ("except Portugal" after "second fav").
- Use ONLY memories in the catalog below. Do not invent picks, teams, or memory ids.
- No profile data, no contradiction roasting, no prediction digests unless a memory explicitly contains them.
- For identity/loyalty questions (who they support, favorite team, second favorite), prefer onboarding and correction memories over match predictions.
- Use prediction memories only when the question is about a pick, match, or scoreline.
- 2-4 sentences. Sound natural, not like a debate roast.
- Do NOT dump receipt text verbatim — synthesize a clear answer in your own words, then cite the supporting memories.
- For "second favorite" questions, find the memory that names the second favorite team (often a correction), not the primary favorite onboarding memory.
- Return 1-2 citedMemoryIds from the catalog that directly support your answer.`;
}

export function buildEvolutionChatTranscript(recentMessages: DebateMessage[]): string {
  return recentMessages
    .filter((message) => message.id !== "opening")
    .slice(-8)
    .map((message) => {
      const cites =
        message.citedReceipts?.length
          ? ` [cited: ${message.citedReceipts.map((receipt) => `#${receipt.number ?? "?"}`).join(", ")}]`
          : "";
      return `${message.role === "user" ? "Fan" : "Clone"}: ${message.text}${cites}`;
    })
    .join("\n");
}

export function buildEvolutionChatUserPrompt(input: {
  phaseLabel: string;
  maturityLabel: CloneMaturity;
  phaseMemories: MemoryReceipt[];
  transcript: string;
  userMessage: string;
  bannedLines?: string[];
}): string {
  const catalogBlock = formatCatalogForPrompt(input.phaseMemories);
  const bannedBlock =
    input.bannedLines && input.bannedLines.length > 0
      ? `Already said (do NOT repeat):\n${input.bannedLines.map((line) => `- ${line.slice(0, 160)}`).join("\n")}\n`
      : "";

  return `Evolution phase: ${input.phaseLabel}
Clone maturity: ${input.maturityLabel}
Memories available this day: ${input.phaseMemories.length}

${bannedBlock}Memory receipt catalog (ONLY use these — cite ids in citedMemoryIds):
${catalogBlock}

Recent chat:
${input.transcript || "No prior messages."}

User message: ${input.userMessage}

Reply as the clone. Return citedMemoryIds for the 1-2 receipts that support your answer.`;
}
