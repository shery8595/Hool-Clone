import {
  extractDebateEntities,
  extractSearchTerms,
} from "@/lib/debate/extract-entities";
import { extractPriorCloneTexts } from "@/lib/debate/thread-variation";
import type { DebateMessage } from "@/lib/mock/types";

export type DebateTopic =
  | "loyalty"
  | "rival"
  | "underdog"
  | "style"
  | "correction"
  | "general";

export type DebateTurnAnalysis = {
  topics: DebateTopic[];
  disputingMemory: boolean;
  denyingPriorClaim: boolean;
  denyingStyleClaim: boolean;
  conceding: boolean;
  changingTopic: boolean;
  absoluteClaim: boolean;
  winnerClaim: boolean;
  playerComparison: boolean;
  matchupQuestion: boolean;
  correctionMention: boolean;
  mentionedEntities: string[];
  searchTerms: string[];
  priorCitedIds: string[];
  priorCloneTexts: string[];
  cloneTurnIndex: number;
  threadSummary: string;
};

const DISPUTE_RE =
  /\b(wrong|outdated|not fair|that's not|that is not|disagree|incorrect|bad take|you misread|memory is wrong|challenge memory)\b/i;
const DENY_CLAIM_RE =
  /\b(never said|didn't say|did not say|i never said|no i never|not what i|wrong about me|that's not true|that is not true|you made that up)\b/i;
const DENY_STYLE_RE =
  /\b(never said i predict|don't predict with stats|do not predict with stats|not a stats|not stats-based|i predict with loyalty|predict with loyalty)\b/i;
const CONCEDE_RE =
  /\b(you're right|you are right|fair point|okay fine|i admit|good point|true enough|sorry i meant)\b/i;
const TOPIC_CHANGE_RE =
  /\b(instead|let's talk about|lets talk about|change topic|what about|switch to)\b/i;
const ABSOLUTE_RE =
  /\b(never|always|every time|wouldn't|would not|can't|cannot|impossible)\b/i;
const WINNER_CLAIM_RE =
  /\b(will win|going to win|who will win|who wins|win the wc|win the world cup|win it all|take the trophy|lifting the trophy)\b/i;

const PLAYER_COMPARE_RE =
  /\b(.+?)\s+(?:or|vs\.?|versus)\s+(.+?)(?:\s+who|\s+which|\s+better|\s+is\s+better|$)/i;

const MATCHUP_RE =
  /\b([a-z][a-z\s]{2,20}?)\s+(?:and|vs\.?|versus)\s+([a-z][a-z\s]{2,20}?)(?:\s+who|\s+which|\?|$)/i;

const TOPIC_PATTERNS: Record<Exclude<DebateTopic, "general">, RegExp> = {
  loyalty: /\b(loyal|favorite|favourite|ride or die|my team|bleed)\b/i,
  rival: /\b(rival|hate|distrust|never trust|can't stand|skeptic)\b/i,
  underdog: /\b(underdog|upset|dark horse|chaos|long shot)\b/i,
  style: /\b(stats?|vibes?|analytics|xG|data|gut feel|emotional)\b/i,
  correction: /\b(correct|correction|teach|retrain|wrong memory|receipt)\b/i,
};

export function analyzeDebateTurn(
  userMessage: string,
  recentMessages: DebateMessage[],
  hints?: {
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
    memoryTexts?: string[];
  },
): DebateTurnAnalysis {
  const topics: DebateTopic[] = [];
  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS) as [
    Exclude<DebateTopic, "general">,
    RegExp,
  ][]) {
    if (pattern.test(userMessage)) topics.push(topic);
  }
  if (topics.length === 0) topics.push("general");

  const priorCitedIds: string[] = [];
  for (const message of recentMessages) {
    if (message.role !== "clone") continue;
    for (const receipt of message.citedReceipts ?? []) {
      if (!priorCitedIds.includes(receipt.id)) {
        priorCitedIds.push(receipt.id);
      }
    }
  }

  const threadLines = recentMessages
    .filter((m) => m.id !== "opening")
    .slice(-4)
    .map((m) => `${m.role === "user" ? "Fan" : "Clone"}: ${m.text.slice(0, 120)}`);

  const priorCloneTexts = extractPriorCloneTexts(recentMessages);
  const cloneTurnIndex = recentMessages.filter((m) => m.role === "clone").length;

  const searchTerms = extractSearchTerms(userMessage, {
    favoriteTeam: hints?.favoriteTeam,
    rivalTeam: hints?.rivalTeam,
    memoryTexts: hints?.memoryTexts,
  });
  const mentionedEntities = extractDebateEntities(userMessage, {
    favoriteTeam: hints?.favoriteTeam,
    rivalTeam: hints?.rivalTeam,
    memoryTexts: hints?.memoryTexts,
  });

  const playerComparison = PLAYER_COMPARE_RE.test(userMessage);
  const winnerClaim = WINNER_CLAIM_RE.test(userMessage);
  const matchupQuestion =
    MATCHUP_RE.test(userMessage) ||
    (winnerClaim && searchTerms.length >= 2);

  return {
    topics,
    disputingMemory: DISPUTE_RE.test(userMessage),
    denyingPriorClaim: DENY_CLAIM_RE.test(userMessage),
    denyingStyleClaim: DENY_STYLE_RE.test(userMessage),
    conceding: CONCEDE_RE.test(userMessage),
    changingTopic: TOPIC_CHANGE_RE.test(userMessage),
    absoluteClaim: ABSOLUTE_RE.test(userMessage),
    winnerClaim,
    playerComparison,
    matchupQuestion,
    correctionMention: topics.includes("correction"),
    mentionedEntities,
    searchTerms,
    priorCitedIds,
    priorCloneTexts,
    cloneTurnIndex,
    threadSummary:
      threadLines.length > 0
        ? threadLines.join(" | ")
        : "Fresh debate — no prior back-and-forth.",
  };
}
