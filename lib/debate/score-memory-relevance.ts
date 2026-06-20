import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import {
  isCorrectionReceipt,
  receiptMentionsEntity,
  scoreReceiptSearchTerms,
} from "@/lib/debate/extract-entities";
import type { MemoryReceipt } from "@/lib/mock/types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
}

export function scoreMemoryRelevance(
  receipt: MemoryReceipt,
  userMessage: string,
  analysis: DebateTurnAnalysis,
): number {
  let score = 0;
  const messageTokens = new Set(tokenize(userMessage));
  const receiptTokens = tokenize(receipt.text);
  const isCorrection = isCorrectionReceipt(receipt);
  const searchTerms = analysis.searchTerms;

  const termScore = scoreReceiptSearchTerms(receipt, searchTerms);
  score += termScore;

  for (const token of receiptTokens) {
    if (messageTokens.has(token)) score += 2;
  }

  for (const entity of analysis.mentionedEntities) {
    if (receiptMentionsEntity(receipt, entity)) score += 8;
  }

  const correctionRelevant =
    analysis.disputingMemory ||
    analysis.correctionMention ||
    analysis.playerComparison ||
    searchTerms.some((term) => receiptMentionsEntity(receipt, term));

  if (isCorrection && correctionRelevant) score += 8;
  if (isCorrection && !correctionRelevant && termScore === 0) score -= 12;

  if (analysis.denyingStyleClaim) {
    if (/\bstats?\b/i.test(receipt.text) && !isCorrection) score += 6;
    if (/\bloyal/i.test(receipt.text) && !isCorrection) score += 6;
  }

  if (analysis.topics.includes("loyalty") && /\b(loyal|favorite|team)\b/i.test(receipt.text)) {
    score += 4;
  }
  if (analysis.topics.includes("rival") && /\b(rival|distrust|trust|despise|hate)\b/i.test(receipt.text)) {
    score += 6;
  }
  if (analysis.topics.includes("underdog") && /\b(underdog|upset|chaos)\b/i.test(receipt.text)) {
    score += 4;
  }
  if (analysis.topics.includes("style") && /\b(stats?|vibes?|style)\b/i.test(receipt.text)) {
    score += 3;
  }

  if (
    (analysis.winnerClaim || analysis.matchupQuestion) &&
    searchTerms.length > 0
  ) {
    const teamHits = searchTerms.filter((term) =>
      receiptMentionsEntity(receipt, term),
    ).length;
    score += teamHits * 6;
  }

  if (analysis.winnerClaim && analysis.mentionedEntities.length > 0) {
    if (
      analysis.mentionedEntities.some((e) => receiptMentionsEntity(receipt, e)) &&
      /\b(overrate|distrust|never trust|underperform|lets them down|heartbreak)\b/i.test(
        receipt.text,
      )
    ) {
      score += 8;
    }
  }

  if (analysis.priorCitedIds.includes(receipt.id)) score -= 6;

  if (receipt.usedInPrediction) score += 1;

  return score;
}

export function rankMemoriesForTurn(
  catalog: MemoryReceipt[],
  userMessage: string,
  analysis: DebateTurnAnalysis,
): MemoryReceipt[] {
  return [...catalog]
    .map((receipt) => ({
      receipt,
      score: scoreMemoryRelevance(receipt, userMessage, analysis),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.receipt);
}
