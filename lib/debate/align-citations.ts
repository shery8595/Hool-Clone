import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import {
  isCorrectionReceipt,
  pickReceiptsBySearchTerms,
  receiptsMatchSearchTerms,
  receiptMentionsEntity,
} from "@/lib/debate/extract-entities";
import { inferCitedReceipts } from "@/lib/debate/infer-citations";
import { rankMemoriesForTurn } from "@/lib/debate/score-memory-relevance";
import type { MemoryReceipt } from "@/lib/mock/types";

function filterToSearchTerms(
  receipts: MemoryReceipt[],
  searchTerms: string[],
): MemoryReceipt[] {
  if (searchTerms.length === 0) return receipts;
  return receipts.filter((receipt) =>
    searchTerms.some((term) => receiptMentionsEntity(receipt, term)),
  );
}

export function alignCitationsToTurn(
  reply: string,
  citedMemoryIds: string[] | undefined,
  catalog: MemoryReceipt[],
  userMessage: string,
  analysis: DebateTurnAnalysis,
): MemoryReceipt[] {
  const ranked = rankMemoriesForTurn(catalog, userMessage, analysis);
  const explicit = inferCitedReceipts(reply, citedMemoryIds, catalog);
  const searchTerms = analysis.searchTerms;

  if (searchTerms.length > 0) {
    const termMatches = pickReceiptsBySearchTerms(ranked, searchTerms, {
      includeCorrections: true,
      limit: 2,
      minScore: 12,
    });

    if (termMatches.length > 0) {
      const validExplicit = filterToSearchTerms(explicit, searchTerms);
      if (
        validExplicit.length > 0 &&
        receiptsMatchSearchTerms(validExplicit, searchTerms)
      ) {
        return validExplicit.slice(0, 2);
      }
      return termMatches;
    }
  }

  if (explicit.length > 0) {
    const nonCorrection = explicit.filter((r) => !isCorrectionReceipt(r));
    return (nonCorrection.length > 0 ? nonCorrection : explicit).slice(0, 2);
  }

  const top =
    ranked.find((r) => !isCorrectionReceipt(r)) ?? ranked[0];
  return top ? [top] : [];
}
