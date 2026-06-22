import type { RecallSource } from "@/lib/mock/types";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";

export type CitationSource = "llm" | "enforced";

export type CitedMemoryPayload = {
  id?: string;
  text: string;
  type?: string;
  source?: string;
  score?: number;
  recallSource?: RecallSource;
  walrusBlobId?: string;
  citationSource?: CitationSource;
};

export type CitationEnforcementResult = {
  message: string;
  citedMemories: CitedMemoryPayload[];
  citationSource: CitationSource;
  citationWarnings: string[];
  droppedInvalidIds: string[];
};

export type EnforceCitationOptions = {
  minCitations?: number;
  minCitationsWhenRecalledAtLeast?: number;
};

export function toCitedMemoryPayload(
  memory: TelegramRankedMemory,
  citationSource: CitationSource = "llm",
): CitedMemoryPayload {
  return {
    id: memory.id,
    text: memory.text,
    type: memory.type,
    source: memory.source,
    score: memory.finalScore ?? memory.score,
    recallSource: memory.recallSource,
    walrusBlobId: memory.walrusBlobId,
    citationSource,
  };
}

export function resolveCitedMemories(
  recalled: TelegramRankedMemory[],
  citedIds?: string[],
  citationSource: CitationSource = "llm",
): CitedMemoryPayload[] {
  if (!citedIds?.length) return [];

  const byId = new Map(
    recalled.filter((m) => m.id).map((m) => [m.id!, toCitedMemoryPayload(m, citationSource)]),
  );

  const cited: CitedMemoryPayload[] = [];
  for (const id of citedIds) {
    const memory = byId.get(id);
    if (memory) cited.push(memory);
  }

  return cited;
}

function enforceMinimumCitations(
  cited: CitedMemoryPayload[],
  recalled: TelegramRankedMemory[],
  minCitations: number,
): { cited: CitedMemoryPayload[]; enforced: boolean } {
  if (recalled.length === 0 || cited.length >= minCitations) {
    return { cited, enforced: false };
  }

  const citedIds = new Set(cited.map((m) => m.id).filter(Boolean));
  const next = [...cited];

  for (const memory of recalled) {
    if (!memory.id || citedIds.has(memory.id)) continue;
    next.push(toCitedMemoryPayload(memory, "enforced"));
    citedIds.add(memory.id);
    if (next.length >= minCitations) break;
  }

  if (next.length === cited.length) {
    return { cited, enforced: false };
  }

  return { cited: next, enforced: true };
}

export function enforceCitationInMessage(
  message: string,
  recalled: TelegramRankedMemory[],
  citedIds?: string[],
  options: EnforceCitationOptions = {},
): CitationEnforcementResult {
  const citationWarnings: string[] = [];
  const droppedInvalidIds: string[] = [];
  const minCitations = options.minCitations ?? 1;
  const minRecalledThreshold = options.minCitationsWhenRecalledAtLeast;
  const effectiveMin =
    minRecalledThreshold != null && recalled.length >= minRecalledThreshold
      ? Math.max(minCitations, 2)
      : minCitations;

  const validIdSet = new Set(
    recalled.map((m) => m.id).filter((id): id is string => Boolean(id)),
  );

  if (citedIds?.length) {
    for (const id of citedIds) {
      if (!validIdSet.has(id)) {
        droppedInvalidIds.push(id);
      }
    }
    if (droppedInvalidIds.length > 0) {
      citationWarnings.push(
        `Dropped ${droppedInvalidIds.length} cited ID(s) not present in recalled set.`,
      );
    }
  }

  let cited = resolveCitedMemories(recalled, citedIds, "llm");
  let citationSource: CitationSource = cited.length > 0 ? "llm" : "enforced";

  if (cited.length === 0 && recalled.length > 0) {
    cited = [toCitedMemoryPayload(recalled[0], "enforced")];
    citationSource = "enforced";
    citationWarnings.push("No valid LLM citations; enforced top recalled memory.");
  }

  const minResult = enforceMinimumCitations(cited, recalled, effectiveMin);
  if (minResult.enforced) {
    cited = minResult.cited;
    if (citationSource === "llm") {
      citationSource = cited.some((m) => m.citationSource === "enforced")
        ? "enforced"
        : "llm";
    }
    citationWarnings.push(
      `Enforced minimum ${effectiveMin} citation(s) from recalled memories.`,
    );
  }

  return {
    message,
    citedMemories: cited,
    citationSource,
    citationWarnings,
    droppedInvalidIds,
  };
}
