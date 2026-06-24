import { storedMemoriesToReceipts } from "@/lib/api/memory-mapper";
import { recallMemoriesForMatch } from "@/lib/clone/recall-memories";
import type { ClashParticipantMeta } from "@/lib/clash/types";
import { getFanProfile } from "@/lib/db/users";
import type { Match } from "@/lib/mock/types";
import type { MemoryReceipt } from "@/lib/mock/types";
import {
  getPublicMemoriesByIds,
  getPublicMemoryByWalrusBlobId,
} from "@/lib/memory/postgres-memory";
import type { StoredMemory } from "@/lib/memory/memory-adapter";

async function buildPublicReceiptCatalog(
  userId: string,
  match: Match,
): Promise<MemoryReceipt[]> {
  const profile = await getFanProfile(userId);
  const recalled = await recallMemoriesForMatch(userId, match, {
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
    preferredStyle: profile?.preferred_style,
    emphasizeCorrections: true,
  });

  const memoryIds = recalled
    .map((r) => r.id)
    .filter((id): id is string => Boolean(id));

  const publicById =
    memoryIds.length > 0
      ? await getPublicMemoriesByIds(userId, memoryIds)
      : [];

  const seen = new Set(publicById.map((m) => m.id));
  const extras: StoredMemory[] = [];

  for (const item of recalled) {
    if (!item.walrusBlobId) continue;
    if (item.id && seen.has(item.id)) continue;

    const row = item.id
      ? null
      : await getPublicMemoryByWalrusBlobId(userId, item.walrusBlobId);

    if (row && !seen.has(row.id)) {
      seen.add(row.id);
      extras.push(row);
    }
  }

  return storedMemoriesToReceipts([...publicById, ...extras]);
}

export async function recallForClashParticipant(
  meta: ClashParticipantMeta,
  match: Match,
): Promise<MemoryReceipt[]> {
  return buildPublicReceiptCatalog(meta.userId, match);
}

export async function recallForClashBoth(
  participantA: ClashParticipantMeta,
  participantB: ClashParticipantMeta,
  match: Match,
): Promise<{ receiptsA: MemoryReceipt[]; receiptsB: MemoryReceipt[] }> {
  const [receiptsA, receiptsB] = await Promise.all([
    buildPublicReceiptCatalog(participantA.userId, match),
    buildPublicReceiptCatalog(participantB.userId, match),
  ]);
  return { receiptsA, receiptsB };
}
