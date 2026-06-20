import type {
  MemoryAdapter,
  MemoryRecord,
  MemorySearchResult,
  StoredMemory,
} from "@/lib/memory/memory-adapter";
import {
  insertMemoryRow,
  listMemoriesForUser,
  recallMemoriesLocal,
} from "@/lib/memory/postgres-memory";

export class LocalMemoryAdapter implements MemoryAdapter {
  async health(): Promise<{ ok: boolean; message?: string }> {
    return { ok: true, message: "Local Postgres memory store" };
  }

  async remember(
    userId: string,
    memory: MemoryRecord,
  ): Promise<{ id?: string; status: string }> {
    const row = await insertMemoryRow(userId, memory, "stored");
    return { id: row.id, status: "stored" };
  }

  async recall(userId: string, queryText: string): Promise<MemorySearchResult[]> {
    return recallMemoriesLocal(userId, queryText);
  }

  async listMemories(userId: string): Promise<StoredMemory[]> {
    return listMemoriesForUser(userId);
  }
}
