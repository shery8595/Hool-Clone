import { query, queryOne } from "@/lib/db/client";
import type {
  MemoryRecord,
  MemorySearchResult,
  StoredMemory,
} from "@/lib/memory/memory-adapter";

type MemoryRow = {
  id: string;
  memory_type: string;
  text: string;
  metadata: Record<string, unknown>;
  storage_status: string;
  public_visible: boolean;
  question_id: string | null;
  created_at: Date;
};

function rowToStoredMemory(row: MemoryRow): StoredMemory {
  return {
    id: row.id,
    type: row.memory_type,
    text: row.text,
    metadata: row.metadata ?? {},
    storageStatus: row.storage_status,
    publicVisible: row.public_visible,
    createdAt: row.created_at.toISOString(),
    questionId: row.question_id ?? undefined,
  };
}

export async function insertMemoryRow(
  userId: string,
  memory: MemoryRecord,
  storageStatus: string,
): Promise<StoredMemory> {
  const questionId =
    typeof memory.metadata?.questionId === "string"
      ? memory.metadata.questionId
      : null;

  const row = await queryOne<MemoryRow>(
    `insert into memories (user_id, memory_type, text, metadata, storage_status, question_id)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      userId,
      memory.type,
      memory.text,
      JSON.stringify(memory.metadata ?? {}),
      storageStatus,
      questionId,
    ],
  );

  if (!row) throw new Error("Failed to insert memory");
  return rowToStoredMemory(row);
}

export async function updateMemoryStorage(
  memoryId: string,
  storageStatus: string,
  metadataPatch: Record<string, unknown> = {},
): Promise<void> {
  await query(
    `update memories
     set storage_status = $2,
         metadata = metadata || $3::jsonb
     where id = $1`,
    [memoryId, storageStatus, JSON.stringify(metadataPatch)],
  );
}

export async function listEarliestMemoriesForUser(
  userId: string,
  limit = 5,
): Promise<StoredMemory[]> {
  return listMemoriesChronologicalForUser(userId, limit);
}

export async function listMemoriesChronologicalForUser(
  userId: string,
  limit = 20,
): Promise<StoredMemory[]> {
  const rows = await query<MemoryRow>(
    `select * from memories
     where user_id = $1
       and coalesce((metadata->>'disputed')::boolean, false) = false
     order by created_at asc
     limit $2`,
    [userId, limit],
  );
  return rows.map(rowToStoredMemory);
}

export async function listMemoriesForUser(
  userId: string,
  limit?: number,
): Promise<StoredMemory[]> {
  const rows = await query<MemoryRow>(
    limit
      ? `select * from memories
         where user_id = $1
           and coalesce((metadata->>'disputed')::boolean, false) = false
         order by created_at desc
         limit $2`
      : `select * from memories
         where user_id = $1
           and coalesce((metadata->>'disputed')::boolean, false) = false
         order by created_at desc`,
    limit ? [userId, limit] : [userId],
  );
  return rows.map(rowToStoredMemory);
}

export async function recallMemoriesLocal(
  userId: string,
  queryText: string,
): Promise<MemorySearchResult[]> {
  const terms = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const rows = await query<MemoryRow>(
    `select * from memories
     where user_id = $1
       and coalesce((metadata->>'disputed')::boolean, false) = false
     order by created_at desc
     limit 50`,
    [userId],
  );

  if (terms.length === 0) {
    return rows.slice(0, 10).map((row) => ({
      text: row.text,
      score: 0.5,
      metadata: {
        ...row.metadata,
        memoryId: row.id,
        memoryType: row.memory_type,
        source: "postgres_fallback",
      },
    }));
  }

  return rows
    .map((row) => {
      const haystack = row.text.toLowerCase();
      const hits = terms.filter((term) => haystack.includes(term)).length;
      return {
        text: row.text,
        score: hits / terms.length,
        metadata: {
          ...row.metadata,
          memoryId: row.id,
          memoryType: row.memory_type,
          source: "postgres_fallback",
        },
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 10);
}

export async function getMemoryRowById(
  memoryId: string,
  userId: string,
): Promise<MemoryRow | null> {
  return queryOne<MemoryRow>(
    `select * from memories where id = $1 and user_id = $2`,
    [memoryId, userId],
  );
}
