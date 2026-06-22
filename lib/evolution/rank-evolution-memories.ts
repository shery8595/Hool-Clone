import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import { scoreMemoryRelevance } from "@/lib/debate/score-memory-relevance";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";

const SECOND_FAVORITE_RE =
  /\b(second|2nd)\s+(?:fav|favorite|favourite|team|side)|\b(?:fav|favorite|favourite)\s+(?:second|2nd)\b/i;

const EXCEPT_PRIMARY_RE =
  /\b(except|besides|apart from|aside from|other than|aside for)\b/i;

const PRIMARY_SUPPORT_RE =
  /\b(who\s+.*support|what(?:'s| is)\s+my\s+(?:fav|favorite|favourite)\s+team|favorite\s+team)\b/i;

type EvolutionThreadMessage = Pick<DebateMessage, "role" | "text">;

function isPredictionReceipt(receipt: MemoryReceipt): boolean {
  const text = receipt.text.toLowerCase();
  return (
    text.startsWith("[prediction]") ||
    receipt.memorySource === "prediction" ||
    receipt.memorySource === "prediction_submit"
  );
}

function isSecondFavoriteReceipt(receipt: MemoryReceipt): boolean {
  return /\b(second|2nd)\s+(?:fav|favorite|favourite)\s+team\b/i.test(
    receipt.text,
  );
}

function isPrimaryFavoriteReceipt(receipt: MemoryReceipt): boolean {
  return /\bfavo(?:rite|urite)\s+team\s+is\b/i.test(receipt.text);
}

export function isSecondFavoriteQuestion(
  message: string,
  recentMessages: EvolutionThreadMessage[] = [],
): boolean {
  if (SECOND_FAVORITE_RE.test(message.trim())) return true;

  if (!EXCEPT_PRIMARY_RE.test(message.trim())) return false;

  const recentUser = recentMessages
    .filter((entry) => entry.role === "user")
    .slice(-3)
    .map((entry) => entry.text)
    .join(" ");

  return (
    SECOND_FAVORITE_RE.test(recentUser) ||
    PRIMARY_SUPPORT_RE.test(recentUser) ||
    /\bsecond\b/i.test(recentUser)
  );
}

function scoreEvolutionMemory(
  receipt: MemoryReceipt,
  userMessage: string,
  analysis: DebateTurnAnalysis,
  secondFavoriteQuestion: boolean,
): number {
  let score = scoreMemoryRelevance(receipt, userMessage, analysis);
  const text = receipt.text.toLowerCase();

  if (secondFavoriteQuestion) {
    if (isSecondFavoriteReceipt(receipt)) score += 60;
    if (/\b(dark horses?|darkhorses?)\b/i.test(text)) score += 8;
    if (isPrimaryFavoriteReceipt(receipt)) score -= 35;
    if (isPredictionReceipt(receipt)) score -= 25;
    if (/\bunderperform|cristiano\b/i.test(text) && !isSecondFavoriteReceipt(receipt)) {
      score -= 20;
    }
  }

  if (analysis.topics.includes("loyalty") && isPrimaryFavoriteReceipt(receipt)) {
    score += 6;
  }

  return score;
}

export function rankEvolutionMemoriesForTurn(
  catalog: MemoryReceipt[],
  userMessage: string,
  analysis: DebateTurnAnalysis,
  recentMessages: EvolutionThreadMessage[] = [],
): MemoryReceipt[] {
  const secondFavoriteQuestion = isSecondFavoriteQuestion(
    userMessage,
    recentMessages,
  );

  return [...catalog]
    .map((receipt) => ({
      receipt,
      score: scoreEvolutionMemory(
        receipt,
        userMessage,
        analysis,
        secondFavoriteQuestion,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.receipt);
}
