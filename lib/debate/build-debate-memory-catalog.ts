import { storedMemoryToReceipt } from "@/lib/api/memory-mapper";
import { recallMemoriesForMatch } from "@/lib/clone/recall-memories";
import type { DbFanProfile } from "@/lib/db/users";
import { getMemoryAdapter } from "@/lib/memory";
import type { MemorySearchResult } from "@/lib/memory/memory-adapter";
import type { DebateMessage, MemoryReceipt, RecallSource } from "@/lib/mock/types";
import { isUuid } from "@/lib/utils";

function recallSourceFromMetadata(
  metadata: Record<string, unknown> | undefined,
): RecallSource | undefined {
  if (metadata?.source === "walrus") return "walrus";
  if (metadata?.source === "postgres_fallback") return "postgres_fallback";
  return undefined;
}

function mergeRecalledResults(
  ranked: MemoryReceipt[],
  seen: Set<string>,
  results: MemorySearchResult[],
  byId: Map<string, MemoryReceipt>,
  byText: Map<string, MemoryReceipt>,
): void {
  for (const result of results) {
    const metadata = result.metadata ?? {};
    const id =
      typeof metadata.memoryId === "string" && isUuid(metadata.memoryId)
        ? metadata.memoryId
        : byText.get(result.text.trim().toLowerCase())?.id;
    if (!id || seen.has(id) || !byId.has(id)) continue;

    const recallSource = recallSourceFromMetadata(metadata);
    seen.add(id);
    ranked.push({
      ...byId.get(id)!,
      recallSource: recallSource ?? byId.get(id)!.recallSource,
    });
  }
}

function recentThreadQuery(recentMessages: DebateMessage[]): string {
  return recentMessages
    .filter((m) => m.id !== "opening")
    .slice(-3)
    .map((m) => m.text)
    .join(" ");
}

export async function buildDebateMemoryCatalog(
  userId: string,
  userMessage: string,
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style"
  > | null,
  recentMessages: DebateMessage[] = [],
): Promise<MemoryReceipt[]> {
  const adapter = getMemoryAdapter();
  const stored = await adapter.listMemories(userId);
  const chronological = [...stored].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const receipts = chronological.map(storedMemoryToReceipt);
  const byId = new Map(receipts.map((receipt) => [receipt.id, receipt]));
  const byText = new Map(
    receipts.map((receipt) => [receipt.text.trim().toLowerCase(), receipt]),
  );

  const ranked: MemoryReceipt[] = [];
  const seen = new Set<string>();

  const threadContext = recentThreadQuery(recentMessages);
  const [fromMessage, fromTopic, fromThread, fromLoyalty, fromRival, fromCorrections] =
    await Promise.all([
      adapter.recall(userId, userMessage),
      adapter.recall(userId, `${userMessage} World Cup football prediction bias`),
      threadContext
        ? adapter.recall(userId, `${threadContext} debate football memory`)
        : Promise.resolve([]),
      profile?.favorite_team
        ? adapter.recall(userId, `${profile.favorite_team} loyalty favorite team`)
        : Promise.resolve([]),
      profile?.rival_team
        ? adapter.recall(userId, `${profile.rival_team} rival distrust`)
        : Promise.resolve([]),
      adapter.recall(userId, "debate correction clone disagreement user correction"),
    ]);

  mergeRecalledResults(ranked, seen, fromMessage, byId, byText);
  mergeRecalledResults(ranked, seen, fromTopic, byId, byText);
  mergeRecalledResults(ranked, seen, fromThread, byId, byText);
  mergeRecalledResults(ranked, seen, fromLoyalty, byId, byText);
  mergeRecalledResults(ranked, seen, fromRival, byId, byText);
  mergeRecalledResults(ranked, seen, fromCorrections, byId, byText);

  const matchRecalled = await recallMemoriesForMatch(
    userId,
    {
      id: "debate",
      matchNumber: 0,
      stage: "Debate",
      homeTeam: {
        code: "HOM",
        name: profile?.favorite_team ?? "Favorite",
        flag: "",
      },
      awayTeam: {
        code: "AWY",
        name: profile?.rival_team ?? "Rival",
        flag: "",
      },
      kickoffAt: new Date().toISOString(),
      venue: "HoolClone",
      city: "Memory",
    },
    {
      favoriteTeam: profile?.favorite_team,
      rivalTeam: profile?.rival_team,
      preferredStyle: profile?.preferred_style,
      emphasizeCorrections: true,
    },
  );
  for (const recalled of matchRecalled) {
    if (!recalled.id || seen.has(recalled.id) || !byId.has(recalled.id)) {
      continue;
    }
    seen.add(recalled.id);
    ranked.push({
      ...byId.get(recalled.id)!,
      recallSource: recalled.recallSource ?? byId.get(recalled.id)!.recallSource,
    });
  }

  if (ranked.length < 6) {
    for (const receipt of [...receipts].reverse().slice(0, 12)) {
      if (seen.has(receipt.id)) continue;
      seen.add(receipt.id);
      ranked.push(receipt);
      if (ranked.length >= 8) break;
    }
  }

  return ranked.slice(0, 10);
}

export function formatCatalogForPrompt(catalog: MemoryReceipt[]): string {
  if (catalog.length === 0) return "No stored memory receipts yet.";
  return catalog
    .map(
      (receipt) =>
        `[#${receipt.number ?? "?"}] id=${receipt.id} type=${receipt.type}: "${receipt.text.slice(0, 220)}${receipt.text.length > 220 ? "…" : ""}"`,
    )
    .join("\n");
}
