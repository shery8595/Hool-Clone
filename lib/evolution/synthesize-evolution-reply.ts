import type { MemoryReceipt } from "@/lib/mock/types";
import { isSecondFavoriteQuestion } from "@/lib/evolution/rank-evolution-memories";

function cleanTeamName(value: string): string {
  return value
    .replace(/^(correction|onboarding):\s*/i, "")
    .replace(/[.:;,"']+$/g, "")
    .trim()
    .split(/\s+/)
    .map((part) =>
      part.length <= 3
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function extractPrimaryTeam(receipt: MemoryReceipt): string | null {
  const favorite = receipt.text.match(
    /\bfavo(?:rite|urite)\s+team\s+is\s+([a-z][a-z\s]{1,30})/i,
  );
  if (favorite?.[1]) return cleanTeamName(favorite[1]);

  const support = receipt.text.match(
    /\b(?:bleed|support|root for|fan of)\s+([a-z][a-z\s]{1,30})/i,
  );
  if (support?.[1]) return cleanTeamName(support[1]);

  return null;
}

function extractSecondaryTeam(receipt: MemoryReceipt): string | null {
  const before = receipt.text.match(
    /\b([a-z][a-z\s]{1,30}?)\s+(?:are|is)\s+my\s+second\s+favo(?:rite|urite)\s+team\b/i,
  );
  if (before?.[1]) return cleanTeamName(before[1]);

  const after = receipt.text.match(
    /\bmy\s+second\s+favo(?:rite|urite)\s+team\s+(?:is|are)\s+([a-z][a-z\s]{1,30})/i,
  );
  if (after?.[1]) return cleanTeamName(after[1]);

  return null;
}

function summarizeReceipt(receipt: MemoryReceipt): string {
  const text = receipt.text
    .replace(/^correction:\s*/i, "")
    .replace(/^onboarding:\s*/i, "")
    .replace(/\s*match:.*$/i, "")
    .trim();

  if (text.length <= 120) return text;
  return `${text.slice(0, 117).trim()}…`;
}

export function synthesizeEvolutionReply(input: {
  userMessage: string;
  recentMessages: Array<{ role: "user" | "clone"; text: string }>;
  citedReceipts: MemoryReceipt[];
}): string {
  const primary = input.citedReceipts[0];
  if (!primary) {
    return "I don't have a stored memory that answers that yet.";
  }

  const secondFavorite = isSecondFavoriteQuestion(
    input.userMessage,
    input.recentMessages,
  );
  const secondaryTeam = extractSecondaryTeam(primary);
  const primaryTeam = extractPrimaryTeam(primary);

  if (secondFavorite && secondaryTeam) {
    const extra = /\bdark horses?\b/i.test(primary.text)
      ? " You also called them dark horses of the tournament."
      : "";
    return `Your second favorite team is ${secondaryTeam}.${extra} That's straight from your stored correction.`;
  }

  if (secondFavorite) {
    return `The clearest memory on your second favorite team is: ${summarizeReceipt(primary)}`;
  }

  if (primaryTeam) {
    return `You support ${primaryTeam}. That's what your onboarding memory says.`;
  }

  return `Based on what I've stored: ${summarizeReceipt(primary)}`;
}
