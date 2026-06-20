import type { MemoryReceipt } from "@/lib/mock/types";

export type GenerateDebateReplyResult = {
  text: string;
  citedReceipts: MemoryReceipt[];
};
