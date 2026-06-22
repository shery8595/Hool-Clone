import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import {
  isCorrectionReceipt,
  pickEntityReceipts,
  pickReceiptsBySearchTerms,
  receiptMentionsEntity,
} from "@/lib/debate/extract-entities";
import { rankMemoriesForTurn } from "@/lib/debate/score-memory-relevance";
import type { MemoryReceipt } from "@/lib/mock/types";

function findMemory(
  catalog: MemoryReceipt[],
  pattern: RegExp,
  excludeCorrection = true,
): MemoryReceipt | undefined {
  return catalog.find(
    (r) => pattern.test(r.text) && (!excludeCorrection || !isCorrectionReceipt(r)),
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function pickBackedTeamReceipt(
  ranked: MemoryReceipt[],
  backedTeam: string,
  opponentTeam: string,
): MemoryReceipt | undefined {
  const matches = pickReceiptsBySearchTerms(ranked, [backedTeam], {
    includeCorrections: true,
    limit: 4,
    minScore: 12,
  });

  const supportive = matches.find((receipt) => {
    const text = receipt.text.toLowerCase();
    if (!text.includes(backedTeam)) return false;
    if (
      text.includes(opponentTeam) &&
      /\b(underperform|distrust|never trust|choke|bias)\b/i.test(text) &&
      !text.includes(`vs ${capitalize(opponentTeam)}`.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return supportive ?? matches[0];
}

const NON_MATCHUP_OPPONENTS = new Set(["world cup"]);

export function shouldUseSpecializedDebateReply(
  analysis: DebateTurnAnalysis,
  userMessage: string,
): boolean {
  if (analysis.denyingPriorClaim || analysis.denyingStyleClaim) return true;
  if (analysis.playerComparison) return true;
  if (/\b(despise|hate most|loathe the most|can't stand most)\b/i.test(userMessage)) {
    return true;
  }
  if (analysis.declaringFavoriteTeam) return true;
  if (
    analysis.backedTeam &&
    analysis.opponentTeam &&
    !NON_MATCHUP_OPPONENTS.has(analysis.opponentTeam)
  ) {
    return true;
  }
  return false;
}

export function trySpecializedDebateReply(input: {
  userMessage: string;
  analysis: DebateTurnAnalysis;
  catalog: MemoryReceipt[];
  profileFavoriteTeam?: string | null;
}): { text: string; citedReceipts: MemoryReceipt[] } | null {
  const ranked = rankMemoriesForTurn(
    input.catalog,
    input.userMessage,
    input.analysis,
  );
  const { analysis } = input;
  const entities = analysis.mentionedEntities;
  const searchTerms = analysis.searchTerms;

  if (analysis.declaringFavoriteTeam) {
    const team = analysis.declaringFavoriteTeam;
    const receipts = pickReceiptsBySearchTerms(ranked, [team], {
      includeCorrections: true,
      limit: 2,
      minScore: 12,
    });
    const primary = receipts[0];
    if (primary) {
      const profileFav = input.profileFavoriteTeam?.toLowerCase();
      const shiftNote =
        profileFav && profileFav !== team
          ? ` I'll weight ${capitalize(team)} over ${capitalize(profileFav)} from here.`
          : "";
      return {
        text: `Noted — ${capitalize(team)} is your team now.${shiftNote} Receipt #${primary.number} already backs that shift: "${primary.text.slice(0, 120)}${primary.text.length > 120 ? "…" : ""}"`,
        citedReceipts: [primary],
      };
    }
  }

  if (analysis.backedTeam && analysis.opponentTeam) {
    const backed = analysis.backedTeam;
    const opponent = analysis.opponentTeam;
    const primary = pickBackedTeamReceipt(ranked, backed, opponent);
    if (primary) {
      return {
        text: `You're backing ${capitalize(backed)} over ${capitalize(opponent)} — receipt #${primary.number} lines up with that: "${primary.text.slice(0, 120)}${primary.text.length > 120 ? "…" : ""}"`,
        citedReceipts: [primary],
      };
    }
  }

  if (analysis.playerComparison && searchTerms.length > 0) {
    const primary = pickReceiptsBySearchTerms(ranked, searchTerms, {
      includeCorrections: true,
      limit: 1,
      minScore: 12,
    })[0];
    if (primary) {
      return {
        text: `You're fishing for a GOAT take — receipt #${primary.number} is the memory that actually fits this: "${primary.text.slice(0, 140)}${primary.text.length > 140 ? "…" : ""}"`,
        citedReceipts: [primary],
      };
    }
  }

  if (
    /\b(despise|hate most|loathe the most|can't stand most)\b/i.test(
      input.userMessage,
    ) &&
    searchTerms.length > 0
  ) {
    const rivalReceipts = pickReceiptsBySearchTerms(ranked, searchTerms, {
      includeCorrections: false,
      limit: 2,
      minScore: 12,
    });
    if (rivalReceipts.length > 0) {
      const primary = rivalReceipts[0]!;
      const extra =
        rivalReceipts.length > 1
          ? ` Receipt #${rivalReceipts[1]!.number} backs it up too.`
          : "";
      return {
        text: `Easy one — receipt #${primary.number} is the grudge on file: "${primary.text.slice(0, 120)}${primary.text.length > 120 ? "…" : ""}"${extra}`,
        citedReceipts: rivalReceipts.slice(0, 2),
      };
    }
  }

  if (analysis.denyingPriorClaim || analysis.denyingStyleClaim) {
    const statsMem = findMemory(ranked, /\bstats?\b/i);
    const loyaltyMem = findMemory(ranked, /\bloyal/i);
    if (statsMem && loyaltyMem) {
      return {
        text: `Fair — I shouldn't put words in your mouth. Your own receipts disagree though: #${statsMem.number} says stats, #${loyaltyMem.number} says loyalty. Which one should I trust?`,
        citedReceipts: [statsMem, loyaltyMem],
      };
    }
    if (statsMem) {
      return {
        text: `Got it — but receipt #${statsMem.number} still says "${statsMem.text}". Want me to dispute that memory?`,
        citedReceipts: [statsMem],
      };
    }
    if (loyaltyMem) {
      return {
        text: `Noted — your loyalty receipt #${loyaltyMem.number} ("${loyaltyMem.text}") is what I've been weighting instead.`,
        citedReceipts: [loyaltyMem],
      };
    }
  }

  if (entities.length > 0 && !analysis.winnerClaim) {
    const entityReceipts = pickEntityReceipts(ranked, entities, {
      excludeCorrections: false,
      limit: 1,
    });
    const primary = entityReceipts[0];
    if (primary) {
      const entity = entities[0]!;
      return {
        text: `On ${entity} — receipt #${primary.number} is the memory I'm pulling from: "${primary.text.slice(0, 120)}${primary.text.length > 120 ? "…" : ""}"`,
        citedReceipts: [primary],
      };
    }
  }

  if (analysis.correctionMention || analysis.disputingMemory) {
    const correction = ranked.find((r) => isCorrectionReceipt(r));
    if (correction) {
      return {
        text: `You're pushing back on memory — receipt #${correction.number} is the correction on file. Tell me what to update.`,
        citedReceipts: [correction],
      };
    }
  }

  return null;
}
