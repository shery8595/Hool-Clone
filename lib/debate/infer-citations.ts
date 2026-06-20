import type { MemoryReceipt } from "@/lib/mock/types";
import { isUuid } from "@/lib/utils";

/** Resolve citations only from explicit ids or #numbers — no fuzzy guessing. */
export function inferCitedReceipts(
  reply: string,
  citedMemoryIds: string[] | undefined,
  catalog: MemoryReceipt[],
): MemoryReceipt[] {
  const byId = new Map(catalog.map((receipt) => [receipt.id, receipt]));
  const cited: MemoryReceipt[] = [];
  const seen = new Set<string>();

  const add = (receipt: MemoryReceipt | undefined) => {
    if (!receipt || seen.has(receipt.id)) return;
    seen.add(receipt.id);
    cited.push(receipt);
  };

  for (const id of citedMemoryIds ?? []) {
    if (isUuid(id)) add(byId.get(id));
    if (cited.length >= 3) return cited;
  }

  const numberMatches = reply.matchAll(/#(\d+)/g);
  for (const match of numberMatches) {
    const num = Number(match[1]);
    add(catalog.find((r) => r.number === num));
    if (cited.length >= 3) return cited;
  }

  return cited;
}
