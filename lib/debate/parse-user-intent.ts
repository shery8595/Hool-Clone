import type { DebateMessage } from "@/lib/mock/types";
import { KNOWN_ENTITIES } from "@/lib/debate/extract-entities";

export type DebateUserIntent = {
  backedTeam: string | null;
  opponentTeam: string | null;
  declaringFavoriteTeam: string | null;
  affirmingPriorPoint: boolean;
  intentSummary: string | null;
  contextualSearchTerms: string[];
};

const WIN_AGAINST_RE =
  /\b(?:will|going to|gonna|think they(?:'ll| will)|think)\s+(?:they\s+)?(?:will\s+)?win\s+against\s+([a-z][a-z\s]{2,24}?)(?:[.!?,]|$)/i;
const BEAT_RE =
  /\b([a-z][a-z\s]{2,24}?)\s+(?:will |going to |gonna )?(?:win|beat|edge)\s+(?:against |over )?([a-z][a-z\s]{2,24}?)\b/i;
const FAV_IS_RE =
  /\b([a-z][a-z\s]{2,24}?)\s+is\s+(?:my\s+)?(?:fav(?:ourite)?|favorite|team)(?:\s+now)?\b/i;
const MY_FAV_RE =
  /\bmy\s+(?:fav(?:ourite)?|favorite|team)\s+(?:is\s+)?(?:now\s+)?([a-z][a-z\s]{2,24}?)\b/i;

const NON_MATCHUP_OPPONENTS = new Set(["world cup"]);

function teamsInText(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_ENTITIES.filter((entity) => lower.includes(entity));
}

function normalizeTeam(name: string): string | null {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed || trimmed.length < 3) return null;

  const exact = KNOWN_ENTITIES.find((entity) => entity === trimmed);
  if (exact) return exact;

  const contained = KNOWN_ENTITIES.find((entity) => trimmed.includes(entity));
  if (contained) return contained;

  if (trimmed.length >= 4) {
    return (
      KNOWN_ENTITIES.find((entity) => entity.includes(trimmed)) ?? null
    );
  }

  return null;
}

function teamsFromThread(recentMessages: DebateMessage[]): string[] {
  const fullText = recentMessages
    .flatMap((message) => [
      message.text,
      ...(message.citedReceipts ?? []).map((receipt) => receipt.text),
    ])
    .join(" ")
    .toLowerCase();

  return KNOWN_ENTITIES.filter((entity) => fullText.includes(entity));
}

function inferBackedTeamFromContext(input: {
  userMessage: string;
  opponentTeam: string;
  messageTeams: string[];
  threadTeams: string[];
  recentMessages: DebateMessage[];
}): string | null {
  const fromMessage = input.messageTeams.find(
    (team) => team !== input.opponentTeam,
  );
  if (fromMessage) return fromMessage;

  if (!/\b(they|them|their)\b/i.test(input.userMessage)) {
    return null;
  }

  const threadText = input.recentMessages
    .flatMap((message) => [
      message.text,
      ...(message.citedReceipts ?? []).map((receipt) => receipt.text),
    ])
    .join(" ")
    .toLowerCase();

  const candidates = input.threadTeams.filter(
    (team) => team !== input.opponentTeam,
  );

  const positive = candidates.find(
    (team) =>
      threadText.includes(team) &&
      new RegExp(
        `${team}.{0,40}(attack|best|fav|picked|hyped|love|back|win)`,
        "i",
      ).test(threadText),
  );
  if (positive) return positive;

  return candidates[0] ?? null;
}

export function parseDebateUserIntent(
  userMessage: string,
  recentMessages: DebateMessage[],
  hints: { favoriteTeam?: string | null; rivalTeam?: string | null },
): DebateUserIntent {
  const messageTeams = teamsInText(userMessage);
  const threadTeams = teamsFromThread(recentMessages);
  const contextualSearchTerms = new Set(messageTeams);

  let backedTeam: string | null = null;
  let opponentTeam: string | null = null;
  let declaringFavoriteTeam: string | null = null;
  const affirmingPriorPoint =
    /\b(they really do|you're right|you are right|true|yeah|exactly|fair point|i agree)\b/i.test(
      userMessage,
    );

  const beatMatch = userMessage.match(BEAT_RE);
  if (beatMatch) {
    backedTeam = normalizeTeam(beatMatch[1] ?? "");
    opponentTeam = normalizeTeam(beatMatch[2] ?? "");
    if (backedTeam && !opponentTeam) {
      backedTeam = null;
    }
  }

  const againstMatch = userMessage.match(WIN_AGAINST_RE);
  if (againstMatch) {
    opponentTeam = normalizeTeam(againstMatch[1] ?? "") ?? opponentTeam;
  }

  if (opponentTeam && !backedTeam) {
    backedTeam = inferBackedTeamFromContext({
      userMessage,
      opponentTeam,
      messageTeams,
      threadTeams,
      recentMessages,
    });
  }

  const favMatch = userMessage.match(FAV_IS_RE) ?? userMessage.match(MY_FAV_RE);
  if (favMatch) {
    declaringFavoriteTeam = normalizeTeam(favMatch[1] ?? "");
  }

  if (opponentTeam && NON_MATCHUP_OPPONENTS.has(opponentTeam)) {
    opponentTeam = null;
  }
  if (backedTeam && NON_MATCHUP_OPPONENTS.has(backedTeam)) {
    backedTeam = null;
  }
  if (beatMatch && !opponentTeam) {
    const rawOpponent = normalizeTeam(beatMatch[2] ?? "");
    if (rawOpponent && NON_MATCHUP_OPPONENTS.has(rawOpponent)) {
      backedTeam = null;
    }
  }

  if (declaringFavoriteTeam) {
    contextualSearchTerms.add(declaringFavoriteTeam);
  }
  if (backedTeam) contextualSearchTerms.add(backedTeam);
  if (opponentTeam) contextualSearchTerms.add(opponentTeam);

  let intentSummary: string | null = null;
  if (declaringFavoriteTeam) {
    const profileFav = hints.favoriteTeam?.toLowerCase();
    intentSummary =
      profileFav && profileFav !== declaringFavoriteTeam
        ? `Fan is switching their favorite to ${declaringFavoriteTeam} (profile still lists ${hints.favoriteTeam}) — acknowledge the change and cite ${declaringFavoriteTeam} memories.`
        : `Fan is declaring ${declaringFavoriteTeam} as their favorite — acknowledge and cite ${declaringFavoriteTeam} memories.`;
  } else if (backedTeam && opponentTeam) {
    intentSummary = `Fan backs ${backedTeam} to beat ${opponentTeam} — respond about ${backedTeam}'s chances vs ${opponentTeam}. Do NOT argue "${opponentTeam} to win" unless receipts clearly support that.`;
  } else if (affirmingPriorPoint && threadTeams.length > 0) {
    intentSummary = `Fan agrees with the clone's prior point — continue that thread (${threadTeams.join(", ")}) instead of changing topic.`;
  }

  return {
    backedTeam,
    opponentTeam,
    declaringFavoriteTeam,
    affirmingPriorPoint,
    intentSummary,
    contextualSearchTerms: [...contextualSearchTerms],
  };
}
