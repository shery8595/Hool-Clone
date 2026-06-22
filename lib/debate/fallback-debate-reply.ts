import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";
import { isCorrectionReceipt } from "@/lib/debate/extract-entities";
import { rankMemoriesForTurn } from "@/lib/debate/score-memory-relevance";
import { trySpecializedDebateReply } from "@/lib/debate/specialized-replies";
import { pickContradictionForTurn } from "@/lib/debate/thread-variation";
import type { ContradictionFinding } from "@/lib/clone/contradiction-hunter";
import type { MemoryReceipt } from "@/lib/mock/types";
import type { CloneMaturity } from "@/lib/mock/types";

function pickFreshReceipts(
  ranked: MemoryReceipt[],
  priorCitedIds: string[],
): MemoryReceipt[] {
  const fresh = ranked.filter(
    (r) => !priorCitedIds.includes(r.id) && !isCorrectionReceipt(r),
  );
  if (fresh.length > 0) return fresh;
  return ranked.filter((r) => !isCorrectionReceipt(r));
}

export function buildFallbackDebateReply(input: {
  userMessage: string;
  analysis: DebateTurnAnalysis;
  catalog: MemoryReceipt[];
  contradictions: ContradictionFinding[];
  allContradictions: ContradictionFinding[];
  predictionRebuttal: string | null;
  maturityLabel: CloneMaturity;
}): { text: string; citedReceipts: MemoryReceipt[] } {
  const specialized = trySpecializedDebateReply({
    userMessage: input.userMessage,
    analysis: input.analysis,
    catalog: input.catalog,
    profileFavoriteTeam: undefined,
  });
  if (specialized) return specialized;

  const ranked = rankMemoriesForTurn(
    input.catalog,
    input.userMessage,
    input.analysis,
  );
  const fresh = pickFreshReceipts(ranked, input.analysis.priorCitedIds);
  const top = fresh[0];
  const second = fresh[1];

  if (input.analysis.conceding && top) {
    return {
      text: `Fair — I'll weight receipt #${top.number ?? 1} differently next time${second ? `, but #${second.number} still fits your older pattern` : ""}.`,
      citedReceipts: second ? [top, second] : [top],
    };
  }

  if (input.predictionRebuttal) {
    return {
      text: input.predictionRebuttal,
      citedReceipts: top ? [top] : [],
    };
  }

  const contradiction = pickContradictionForTurn(
    input.contradictions.length > 0
      ? input.contradictions
      : input.allContradictions,
    input.analysis,
    input.analysis.cloneTurnIndex,
  );

  if (input.analysis.disputingMemory && top) {
    return {
      text: `You want to dispute that — receipt #${top.number ?? 1} is what I'm working from: "${top.text.slice(0, 100)}${top.text.length > 100 ? "…" : ""}" What should replace it?`,
      citedReceipts: [top],
    };
  }

  if (contradiction && input.analysis.cloneTurnIndex <= 1 && !input.analysis.denyingPriorClaim) {
    const receipt = top ?? second;
    return {
      text: contradiction.text,
      citedReceipts: receipt ? [receipt] : [],
    };
  }

  if (top) {
    return {
      text: `Receipt #${top.number ?? 1} is what I've got on this: "${top.text.slice(0, 110)}${top.text.length > 110 ? "…" : ""}"`,
      citedReceipts: [top],
    };
  }

  return {
    text:
      input.maturityLabel === "Stranger"
        ? "I don't have enough memory to push back yet — train me with a few real football takes first."
        : "Memory is thin on this topic. Train me or store a correction so I can argue with receipts.",
    citedReceipts: [],
  };
}
