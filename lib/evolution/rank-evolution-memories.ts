import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import { scoreMemoryRelevance } from "@/lib/debate/score-memory-relevance";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";

const SECOND_FAVORITE_RE =
  /\b(second|2nd)\s+(?:fav|favorite|favourite|team|side)|\b(?:fav|favorite|favourite)\s+(?:second|2nd)\b/i;

const EXCEPT_PRIMARY_RE =
  /\b(except|besides|apart from|aside from|other than|aside for)\b/i;

const PRIMARY_SUPPORT_RE =
  /\b(who\s+.*support|what(?:'s| is)\s+my\s+(?:fav|favorite|favourite)\s+team|(?:my|fav(?:orite|ourite)?)\s+team|who\s+do\s+i\s+support)\b/i;

const RIVAL_TEAM_RE =
  /\b((?:most\s+)?hat(?:e|ed|es|ing)\s+team|rival\s+team|never\s+trust|can't\s+stand|can\s+not\s+stand|distrust)\b/i;

type EvolutionThreadMessage = Pick<DebateMessage, "role" | "text">;

function isPredictionReceipt(receipt: MemoryReceipt): boolean {
  const text = receipt.text.toLowerCase();
  return (
    text.startsWith("[prediction]") ||
    receipt.memorySource === "prediction" ||
    receipt.memorySource === "prediction_submit"
  );
}

function isOnboardingReceipt(receipt: MemoryReceipt): boolean {
  return receipt.memorySource === "onboarding";
}

function isStyleOnboardingReceipt(receipt: MemoryReceipt): boolean {
  return /\b(predict(?:s|ing)?\s+(?:mostly\s+)?with|preferred\s+style|stats|vibes|chaos|analytics)\b/i.test(
    receipt.text,
  );
}

function isRivalOnboardingReceipt(receipt: MemoryReceipt): boolean {
  return /\b(never trust|distrust|skeptic|choke|disappoint|can't stand)\b/i.test(
    receipt.text,
  );
}

function isFavoriteOnboardingReceipt(receipt: MemoryReceipt): boolean {
  return (
    isOnboardingReceipt(receipt) &&
    !isStyleOnboardingReceipt(receipt) &&
    !isRivalOnboardingReceipt(receipt)
  );
}

function isSecondFavoriteReceipt(receipt: MemoryReceipt): boolean {
  return /\b(second|2nd)\s+(?:fav|favorite|favourite)\s+team\b/i.test(
    receipt.text,
  );
}

function isRivalReceipt(receipt: MemoryReceipt): boolean {
  return (
    isRivalOnboardingReceipt(receipt) ||
    /\b(rival|never trust|distrust|skeptic|can't stand|hate|despise)\b/i.test(
      receipt.text,
    )
  );
}

function isPrimaryFavoriteReceipt(receipt: MemoryReceipt): boolean {
  if (/\bfavo(?:rite|urite)\s+team\s+is\b/i.test(receipt.text)) return true;
  return isFavoriteOnboardingReceipt(receipt);
}

export function isPrimaryFavoriteQuestion(
  message: string,
  recentMessages: EvolutionThreadMessage[] = [],
): boolean {
  if (SECOND_FAVORITE_RE.test(message.trim())) return false;
  if (RIVAL_TEAM_RE.test(message.trim())) return false;
  if (PRIMARY_SUPPORT_RE.test(message.trim())) return true;

  const recentUser = recentMessages
    .filter((entry) => entry.role === "user")
    .slice(-3)
    .map((entry) => entry.text)
    .join(" ");

  return PRIMARY_SUPPORT_RE.test(recentUser) && !SECOND_FAVORITE_RE.test(recentUser);
}

export function isRivalTeamQuestion(
  message: string,
  recentMessages: EvolutionThreadMessage[] = [],
): boolean {
  if (RIVAL_TEAM_RE.test(message.trim())) return true;

  const recentUser = recentMessages
    .filter((entry) => entry.role === "user")
    .slice(-3)
    .map((entry) => entry.text)
    .join(" ");

  return RIVAL_TEAM_RE.test(recentUser);
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
  primaryFavoriteQuestion: boolean,
  rivalTeamQuestion: boolean,
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

  if (primaryFavoriteQuestion) {
    if (isPrimaryFavoriteReceipt(receipt)) score += 60;
    if (isFavoriteOnboardingReceipt(receipt)) score += 20;
    if (isStyleOnboardingReceipt(receipt)) score -= 35;
    if (isRivalReceipt(receipt)) score -= 25;
    if (isPredictionReceipt(receipt)) score -= 40;
  }

  if (rivalTeamQuestion) {
    if (isRivalReceipt(receipt)) score += 60;
    if (isRivalOnboardingReceipt(receipt)) score += 20;
    if (isPrimaryFavoriteReceipt(receipt)) score -= 25;
    if (isStyleOnboardingReceipt(receipt)) score -= 30;
    if (isPredictionReceipt(receipt)) score -= 40;
  }

  if (analysis.topics.includes("loyalty") && isPrimaryFavoriteReceipt(receipt)) {
    score += 6;
  }

  if (analysis.topics.includes("rival") && isRivalReceipt(receipt)) {
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
  const primaryFavoriteQuestion = isPrimaryFavoriteQuestion(
    userMessage,
    recentMessages,
  );
  const rivalTeamQuestion = isRivalTeamQuestion(userMessage, recentMessages);

  return [...catalog]
    .map((receipt) => ({
      receipt,
      score: scoreEvolutionMemory(
        receipt,
        userMessage,
        analysis,
        secondFavoriteQuestion,
        primaryFavoriteQuestion,
        rivalTeamQuestion,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.receipt);
}
