import { query, queryOne } from "@/lib/db/client";
import type {
  MemoryAdapter,
  MemoryRecord,
  MemorySearchResult,
  StoredMemory,
} from "@/lib/memory/memory-adapter";
import { getMemWalClient } from "@/lib/memory/memwal-client";
import {
  getMemoryRowById,
  insertMemoryRow,
  listMemoriesForUser,
  recallMemoriesLocal,
  updateMemoryStorage,
} from "@/lib/memory/postgres-memory";

function formatWalrusPayload(memory: MemoryRecord): string {
  const meta = memory.metadata ?? {};
  const tags: string[] = [`[${memory.type}]`, memory.text];
  if (typeof meta.team === "string") tags.push(`team:${meta.team}`);
  if (typeof meta.driver === "string") tags.push(`driver:${meta.driver}`);
  if (typeof meta.source === "string") tags.push(`source:${meta.source}`);
  return tags.join(" ");
}

const namespaceCache = new Map<string, string>();

async function getUserNamespace(userId: string): Promise<string> {
  const cached = namespaceCache.get(userId);
  if (cached) return cached;

  const row = await queryOne<{ memwal_namespace: string }>(
    `select memwal_namespace from users where id = $1`,
    [userId],
  );
  const namespace = row?.memwal_namespace ?? `hoolclone:user:${userId}`;
  namespaceCache.set(userId, namespace);
  return namespace;
}

function distanceToScore(distance: number): number {
  return Math.max(0, Math.min(1, 1 - distance));
}

export class WalrusMemoryAdapter implements MemoryAdapter {
  async health(): Promise<{ ok: boolean; message?: string }> {
    try {
      const result = await getMemWalClient().health();
      const ok =
        result.status === "ok" ||
        result.status === "healthy" ||
        result.status === "up";
      return {
        ok,
        message: ok
          ? `Walrus relayer ${result.relayerVersion ?? result.version}`
          : `Relayer status: ${result.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Walrus health failed",
      };
    }
  }

  async remember(
    userId: string,
    memory: MemoryRecord,
  ): Promise<{ id?: string; status: string }> {
    const namespace = await getUserNamespace(userId);
    const row = await insertMemoryRow(userId, memory, "pending");

    try {
      const result = await getMemWalClient().rememberAndWait(
        formatWalrusPayload(memory),
        namespace,
        { timeoutMs: 90_000 },
      );

      await updateMemoryStorage(row.id, "stored", {
        walrusBlobId: result.blob_id,
        walrusJobId: result.job_id ?? result.id,
        walrusNamespace: namespace,
      });

      return { id: row.id, status: "stored" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Walrus write failed";
      await updateMemoryStorage(row.id, "failed", { walrusError: message });
      return { id: row.id, status: "failed" };
    }
  }

  async recall(userId: string, queryText: string): Promise<MemorySearchResult[]> {
    const namespace = await getUserNamespace(userId);

    try {
      const result = await getMemWalClient().recall({
        query: queryText,
        limit: 6,
        namespace,
      });

      const blobIds = result.results
        .map((item) => item.blob_id)
        .filter((id): id is string => Boolean(id));

      const memoryIdByBlob = new Map<string, string>();
      if (blobIds.length > 0) {
        const rows = await query<{ id: string; walrus_blob_id: string }>(
          `select id, metadata->>'walrusBlobId' as walrus_blob_id
           from memories
           where user_id = $1
             and metadata->>'walrusBlobId' = any($2::text[])`,
          [userId, blobIds],
        );
        for (const row of rows) {
          if (row.walrus_blob_id) {
            memoryIdByBlob.set(row.walrus_blob_id, row.id);
          }
        }
      }

      return result.results.map((item) => ({
        text: item.text,
        score: distanceToScore(item.distance),
        metadata: {
          blobId: item.blob_id,
          walrusNamespace: namespace,
          source: "walrus",
          memoryId: item.blob_id
            ? memoryIdByBlob.get(item.blob_id)
            : undefined,
        },
      }));
    } catch {
      return recallMemoriesLocal(userId, queryText);
    }
  }

  async listMemories(userId: string): Promise<StoredMemory[]> {
    return listMemoriesForUser(userId);
  }

  async retryFailedMemory(
    userId: string,
    memoryId: string,
  ): Promise<{ status: string }> {
    const row = await getMemoryRowById(memoryId, userId);
    if (!row) throw new Error("Memory not found");
    if (row.storage_status !== "failed") {
      return { status: row.storage_status };
    }

    const namespace = await getUserNamespace(userId);
    await updateMemoryStorage(memoryId, "pending", { walrusError: null });

    try {
      const result = await getMemWalClient().rememberAndWait(
        formatWalrusPayload({
          type: row.memory_type,
          text: row.text,
          metadata: row.metadata,
        }),
        namespace,
        { timeoutMs: 90_000 },
      );

      await updateMemoryStorage(memoryId, "stored", {
        walrusBlobId: result.blob_id,
        walrusJobId: result.job_id ?? result.id,
        walrusNamespace: namespace,
        walrusError: null,
      });

      return { status: "stored" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Walrus retry failed";
      await updateMemoryStorage(memoryId, "failed", { walrusError: message });
      return { status: "failed" };
    }
  }
}
