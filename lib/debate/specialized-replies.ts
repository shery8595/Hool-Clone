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

export function trySpecializedDebateReply(input: {
  userMessage: string;
  analysis: DebateTurnAnalysis;
  catalog: MemoryReceipt[];
}): { text: string; citedReceipts: MemoryReceipt[] } | null {
  const ranked = rankMemoriesForTurn(
    input.catalog,
    input.userMessage,
    input.analysis,
  );
  const { analysis } = input;
  const entities = analysis.mentionedEntities;
  const searchTerms = analysis.searchTerms;

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

  if (
    (analysis.winnerClaim || analysis.matchupQuestion) &&
    searchTerms.length > 0
  ) {
    const termMatches = pickReceiptsBySearchTerms(ranked, searchTerms, {
      includeCorrections: true,
      limit: 2,
      minScore: 12,
    });
    const primary = termMatches[0];
    if (primary) {
      const focusTerm =
        searchTerms.find((term) => receiptMentionsEntity(primary, term)) ??
        searchTerms[0]!;
      const cap = capitalize(focusTerm);
      if (
        /overrate|distrust|never trust|lets them down|underperform/i.test(
          primary.text,
        )
      ) {
        return {
          text: `${cap} to win? Receipt #${primary.number} cuts against that — "${primary.text.slice(0, 120)}${primary.text.length > 120 ? "…" : ""}"`,
          citedReceipts: [primary],
        };
      }
      return {
        text: `On ${focusTerm} — receipt #${primary.number} is what I'm working from: "${primary.text.slice(0, 120)}${primary.text.length > 120 ? "…" : ""}"`,
        citedReceipts: [primary],
      };
    }
  }

  if (entities.length > 0) {
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
