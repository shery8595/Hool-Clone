import type { MemoryReceipt } from "@/lib/mock/types";

export function formatCatalogForPrompt(catalog: MemoryReceipt[]): string {
  if (catalog.length === 0) return "No stored memory receipts yet.";
  return catalog
    .map(
      (receipt) =>
        `[#${receipt.number ?? "?"}] id=${receipt.id} type=${receipt.type}: "${receipt.text.slice(0, 220)}${receipt.text.length > 220 ? "…" : ""}"`,
    )
    .join("\n");
}
