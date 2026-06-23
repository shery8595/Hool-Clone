import type { CloneMemoryReceipt } from "@/lib/llm/schemas/clone-prediction";
import { formatProvenanceLabel } from "@/lib/clone/memory-provenance";
import type { RecalledMemory } from "@/lib/clone/recall-memories";
import type { StoredCloneReceipt } from "@/lib/db/clone-predictions";
import { isUuid } from "@/lib/utils";
import type { Match, MemoryReceipt } from "@/lib/mock/types";

function teamMentioned(text: string, teamName: string): boolean {
  const haystack = text.toLowerCase();
  const needle = teamName.toLowerCase();
  if (!needle) return false;
  return haystack.includes(needle) || haystack.includes(needle.slice(0, 4));
}

function correctionTextMatchesFixture(text: string, match: Match): boolean {
  if (!match.homeTeam || !match.awayTeam) return false;
  const labelMatch = text.match(/Match:\s*([^.]+)\./i);
  if (!labelMatch?.[1]) return false;
  const label = labelMatch[1].toLowerCase();
  const home = match.homeTeam.name.toLowerCase();
  const away = match.awayTeam.name.toLowerCase();
  return label.includes(home) && label.includes(away);
}

/** Whether a correction receipt was stored for this exact fixture (not another match). */
export function isCloneCorrectionForMatch(
  receipt: Pick<MemoryReceipt, "memorySource" | "text" | "metadataMatchId">,
  match: Match,
): boolean {
  const isCorrection =
    receipt.memorySource === "clone_correction" ||
    receipt.text.includes("Correction:");
  if (!isCorrection) return false;

  if (receipt.metadataMatchId && match.id) {
    return receipt.metadataMatchId === match.id;
  }

  return correctionTextMatchesFixture(receipt.text, match);
}

/** Whether a recalled memory is relevant to predicting this specific fixture. */
export function memoryRelevantToMatch(
  memory: RecalledMemory,
  match: Match,
  options?: {
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
  },
): boolean {
  if (!match.homeTeam || !match.awayTeam) return false;

  const home = match.homeTeam.name;
  const away = match.awayTeam.name;
  const mentionsFixtureTeam =
    teamMentioned(memory.text, home) || teamMentioned(memory.text, away);
  const isThisFixture =
    memory.metadataMatchId != null && memory.metadataMatchId === match.id;

  if (memory.source === "clone_correction") {
    return isThisFixture || mentionsFixtureTeam;
  }

  if (memory.type === "correction") {
    return isThisFixture || mentionsFixtureTeam;
  }

  if (
    memory.source === "prediction_submit" ||
    memory.type === "prediction_pattern"
  ) {
    return mentionsFixtureTeam;
  }

  if (
    memory.source === "match_resolution" ||
    memory.source === "telegram_post_match"
  ) {
    return isThisFixture || mentionsFixtureTeam;
  }

  if (
    memory.type === "fan_profile" ||
    memory.type === "bias" ||
    memory.type === "prediction_style" ||
    memory.type === "prediction_history_summary"
  ) {
    return (
      mentionsFixtureTeam ||
      (options?.favoriteTeam != null &&
        teamMentioned(memory.text, options.favoriteTeam)) ||
      (options?.rivalTeam != null &&
        teamMentioned(memory.text, options.rivalTeam))
    );
  }

  return (
    mentionsFixtureTeam ||
    (options?.favoriteTeam != null &&
      teamMentioned(memory.text, options.favoriteTeam)) ||
    (options?.rivalTeam != null && teamMentioned(memory.text, options.rivalTeam))
  );
}

export function pickInfluentialReceiptsForFallback(
  recalledMemories: RecalledMemory[],
  match: Match,
  options?: {
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
    max?: number;
  },
): CloneMemoryReceipt[] {
  const max = options?.max ?? 3;
  const influential = recalledMemories.filter((memory) =>
    memoryRelevantToMatch(memory, match, options),
  );

  const pool =
    influential.length > 0
      ? influential
      : recalledMemories.filter(
          (memory) =>
            isUuid(memory.id) &&
            (memory.source === "clone_correction" ||
              memory.type === "correction"),
        );

  return [...pool]
    .sort((a, b) => {
      const aCorrection =
        a.source === "clone_correction" || a.type === "correction" ? 1 : 0;
      const bCorrection =
        b.source === "clone_correction" || b.type === "correction" ? 1 : 0;
      if (aCorrection !== bCorrection) return bCorrection - aCorrection;
      return b.score - a.score;
    })
    .slice(0, max)
    .map((memory) => ({
      memoryId: isUuid(memory.id) ? memory.id : undefined,
      summary: memory.text,
      memoryType: memory.type ?? "prediction_style",
      strength: (memory.score >= 0.6 ? "high" : "medium") as "medium" | "high",
    }))
    .filter((receipt) => Boolean(receipt.memoryId));
}

export function buildStoredCloneReceipts(
  citedReceipts: CloneMemoryReceipt[],
  recallById: Map<string, RecalledMemory>,
  options?: {
    match: Match;
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
  },
): StoredCloneReceipt[] {
  const seen = new Set<string>();

  return citedReceipts
    .filter((receipt) => receipt.summary.trim().length > 0)
    .filter((receipt) => {
      if (!receipt.memoryId || !isUuid(receipt.memoryId)) return false;
      if (!recallById.has(receipt.memoryId)) return false;
      if (seen.has(receipt.memoryId)) return false;
      seen.add(receipt.memoryId);
      return true;
    })
    .filter((receipt) => {
      if (!options?.match) return true;
      const recalled = recallById.get(receipt.memoryId!)!;
      return memoryRelevantToMatch(recalled, options.match, {
        favoriteTeam: options.favoriteTeam,
        rivalTeam: options.rivalTeam,
      });
    })
    .map((receipt) => {
      const memoryId = receipt.memoryId!;
      const recalled = recallById.get(memoryId)!;
      const memorySource = recalled.source;
      const createdAt = recalled.createdAt ?? new Date().toISOString();
      const walrusBlobId = recalled.walrusBlobId;

      return {
        memoryId,
        summary: receipt.summary,
        memoryType: receipt.memoryType,
        strength: receipt.strength,
        date: createdAt,
        recallSource: recalled.recallSource,
        memorySource,
        metadataMatchId: recalled.metadataMatchId,
        provenanceLabel: formatProvenanceLabel(
          memorySource,
          createdAt,
          recalled.metadataMatchId,
        ),
        walrusBlobId,
        storageStatus: walrusBlobId ? ("stored" as const) : undefined,
      };
    });
}

export function sortReceiptsForMatch(
  receipts: StoredCloneReceipt[],
  recallById: Map<string, RecalledMemory>,
  matchId: string,
): StoredCloneReceipt[] {
  return [...receipts].sort((a, b) => {
    const aRecalled = a.memoryId ? recallById.get(a.memoryId) : undefined;
    const bRecalled = b.memoryId ? recallById.get(b.memoryId) : undefined;
    const aCorrection =
      a.memorySource === "clone_correction" &&
      aRecalled?.metadataMatchId === matchId
        ? 1
        : 0;
    const bCorrection =
      b.memorySource === "clone_correction" &&
      bRecalled?.metadataMatchId === matchId
        ? 1
        : 0;
    if (aCorrection !== bCorrection) return bCorrection - aCorrection;
    const strengthRank = { high: 3, medium: 2, low: 1 };
    const aStrength = strengthRank[a.strength ?? "medium"] ?? 2;
    const bStrength = strengthRank[b.strength ?? "medium"] ?? 2;
    return bStrength - aStrength;
  });
}

export function backfillCloneReceipts(
  receipts: StoredCloneReceipt[],
  recallById: Map<string, RecalledMemory>,
  prior: {
    confidence: "strong" | "weak" | "none";
    supportingMemoryIds: string[];
  },
  options?: { maxBackfill?: number },
): StoredCloneReceipt[] {
  const maxBackfill = options?.maxBackfill ?? 2;
  const result = [...receipts];
  const citedIds = new Set(
    result.map((r) => r.memoryId).filter((id): id is string => Boolean(id)),
  );

  const needsBackfill =
    result.length === 0 ||
    (prior.confidence === "strong" &&
      !prior.supportingMemoryIds.some((id) => citedIds.has(id)));

  if (!needsBackfill) return result;

  for (const memoryId of prior.supportingMemoryIds) {
    if (result.length >= maxBackfill && result.length > 0) break;
    if (!memoryId || citedIds.has(memoryId)) continue;
    const recalled = recallById.get(memoryId);
    if (!recalled) continue;

    const createdAt = recalled.createdAt ?? new Date().toISOString();
    result.push({
      memoryId,
      summary: recalled.text.length > 300 ? `${recalled.text.slice(0, 300)}…` : recalled.text,
      memoryType: recalled.type ?? "prediction_style",
      strength: "high",
      date: createdAt,
      recallSource: recalled.recallSource,
      memorySource: recalled.source,
      metadataMatchId: recalled.metadataMatchId,
      provenanceLabel: formatProvenanceLabel(
        recalled.source,
        createdAt,
        recalled.metadataMatchId,
      ),
      walrusBlobId: recalled.walrusBlobId,
      storageStatus: recalled.walrusBlobId ? "stored" : undefined,
    });
    citedIds.add(memoryId);
  }

  if (result.length === 0 && recallById.size > 0) {
    const top = [...recallById.values()].sort((a, b) => b.score - a.score)[0];
    if (top?.id) {
      const createdAt = top.createdAt ?? new Date().toISOString();
      result.push({
        memoryId: top.id,
        summary: top.text.length > 300 ? `${top.text.slice(0, 300)}…` : top.text,
        memoryType: top.type ?? "remembered",
        strength: "medium",
        date: createdAt,
        recallSource: top.recallSource,
        memorySource: top.source,
        metadataMatchId: top.metadataMatchId,
        provenanceLabel: formatProvenanceLabel(
          top.source,
          createdAt,
          top.metadataMatchId,
        ),
        walrusBlobId: top.walrusBlobId,
        storageStatus: top.walrusBlobId ? "stored" : undefined,
      });
    }
  }

  return result;
}
