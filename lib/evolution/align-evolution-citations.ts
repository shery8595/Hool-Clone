import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import { inferCitedReceipts } from "@/lib/debate/infer-citations";
import { rankEvolutionMemoriesForTurn } from "@/lib/evolution/rank-evolution-memories";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";

const MAX_CITATIONS = 2;

function resolveCatalogIds(
  citedMemoryIds: string[] | undefined,
  phaseCatalog: MemoryReceipt[],
): MemoryReceipt[] {
  if (!citedMemoryIds?.length) return [];

  const byId = new Map(phaseCatalog.map((receipt) => [receipt.id, receipt]));
  const cited: MemoryReceipt[] = [];
  const seen = new Set<string>();

  for (const id of citedMemoryIds) {
    const receipt = byId.get(id);
    if (!receipt || seen.has(receipt.id)) continue;
    seen.add(receipt.id);
    cited.push(receipt);
    if (cited.length >= MAX_CITATIONS) break;
  }

  return cited;
}

export function alignEvolutionCitations(
  reply: string,
  citedMemoryIds: string[] | undefined,
  phaseCatalog: MemoryReceipt[],
  userMessage: string,
  recentMessages: DebateMessage[],
): MemoryReceipt[] {
  const fromIds = resolveCatalogIds(citedMemoryIds, phaseCatalog);
  if (fromIds.length > 0) return fromIds;

  const explicit = inferCitedReceipts(reply, citedMemoryIds, phaseCatalog);
  if (explicit.length > 0) {
    return explicit.slice(0, MAX_CITATIONS);
  }

  if (phaseCatalog.length === 0) return [];

  const analysis = analyzeDebateTurn(userMessage, recentMessages, {
    memoryTexts: phaseCatalog.map((memory) => memory.text),
  });
  const ranked = rankEvolutionMemoriesForTurn(
    phaseCatalog,
    userMessage,
    analysis,
    recentMessages,
  );
  const top = ranked[0];
  return top ? [top] : [];
}
