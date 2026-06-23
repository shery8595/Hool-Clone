import { query } from "@/lib/db/client";
import { syncCloneMaturity } from "@/lib/db/users";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import {
  memoryConsolidationSchema,
  type MemoryConsolidation,
} from "@/lib/llm/schemas/memory-consolidation";
import { getMemoryAdapter } from "@/lib/memory";
import { ACTIVE_MEMORY_SQL } from "@/lib/memory/memory-filters";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import { buildMemoryConsolidationPrompt } from "@/lib/prompts/memory-consolidation";

export const MIN_POOL_SIZE = 8;
export const MIN_CLUSTER_SIZE = 3;
export const COOLING_PERIOD_HOURS = 24;

const CONSOLIDATION_TYPES = [
  "prediction_pattern",
  "prediction_history_summary",
] as const;

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function clusterKey(memory: StoredMemory): string {
  const meta = memory.metadata ?? {};
  const team =
    (typeof meta.team === "string" && meta.team) ||
    (typeof meta.homeTeamCode === "string" && meta.homeTeamCode) ||
    (typeof meta.winner === "string" && meta.winner) ||
    "general";
  return team.toLowerCase();
}

export function clusterMemoriesForConsolidation(
  memories: StoredMemory[],
): StoredMemory[][] {
  const byTeam = new Map<string, StoredMemory[]>();
  for (const memory of memories) {
    const key = clusterKey(memory);
    const group = byTeam.get(key) ?? [];
    group.push(memory);
    byTeam.set(key, group);
  }

  const clusters: StoredMemory[][] = [];

  for (const group of byTeam.values()) {
    const remaining = [...group];
    while (remaining.length > 0) {
      const seed = remaining.shift()!;
      const cluster = [seed];

      for (let i = remaining.length - 1; i >= 0; i--) {
        const candidate = remaining[i]!;
        const candidateTokens = tokenize(candidate.text);
        const matchesCluster = cluster.some(
          (member) =>
            jaccardSimilarity(tokenize(member.text), candidateTokens) >= 0.5,
        );
        if (matchesCluster) {
          cluster.push(candidate);
          remaining.splice(i, 1);
        }
      }

      if (cluster.length >= MIN_CLUSTER_SIZE) {
        clusters.push(cluster);
      }
    }
  }

  return clusters;
}

export async function archiveMemories(
  userId: string,
  memoryIds: string[],
  patch: Record<string, unknown>,
): Promise<number> {
  if (memoryIds.length === 0) return 0;

  const result = await query<{ id: string }>(
    `update memories
     set public_visible = false,
         metadata = metadata || $3::jsonb
     where user_id = $1
       and id = any($2::uuid[])
     returning id`,
    [userId, memoryIds, JSON.stringify(patch)],
  );
  return result.length;
}

async function listUsersEligibleForConsolidation(): Promise<string[]> {
  const rows = await query<{ user_id: string }>(
    `select user_id
     from memories
     where memory_type = any($1::text[])
       and created_at < now() - ($2::text || ' hours')::interval
       and ${ACTIVE_MEMORY_SQL}
     group by user_id
     having count(*) >= $3`,
    [CONSOLIDATION_TYPES, String(COOLING_PERIOD_HOURS), MIN_POOL_SIZE],
  );
  return rows.map((r) => r.user_id);
}

async function listConsolidationCandidates(
  userId: string,
): Promise<StoredMemory[]> {
  const rows = await query<{
    id: string;
    memory_type: string;
    text: string;
    metadata: Record<string, unknown>;
    storage_status: string;
    public_visible: boolean;
    question_id: string | null;
    created_at: Date;
  }>(
    `select id, memory_type, text, metadata, storage_status, public_visible,
            question_id, created_at
     from memories
     where user_id = $1
       and memory_type = any($2::text[])
       and created_at < now() - ($3::text || ' hours')::interval
       and ${ACTIVE_MEMORY_SQL}
     order by created_at asc`,
    [userId, CONSOLIDATION_TYPES, String(COOLING_PERIOD_HOURS)],
  );

  return rows.map((row) => ({
    id: row.id,
    type: row.memory_type,
    text: row.text,
    metadata: row.metadata ?? {},
    storageStatus: row.storage_status,
    publicVisible: row.public_visible,
    createdAt: row.created_at.toISOString(),
    questionId: row.question_id ?? undefined,
  }));
}

function fallbackConsolidation(
  cluster: StoredMemory[],
): MemoryConsolidation {
  const theme = clusterKey(cluster[0]!);
  const sample = cluster[0]!.text.slice(0, 200);
  return {
    consolidatedText: `Recurring prediction pattern (${theme}): ${sample}`,
    theme,
    mergedIds: cluster.map((m) => m.id),
  };
}

async function synthesizeCluster(
  cluster: StoredMemory[],
): Promise<MemoryConsolidation> {
  const llm = getLlmAdapter();
  if (!llm) {
    return fallbackConsolidation(cluster);
  }

  const prompt = buildMemoryConsolidationPrompt({
    memories: cluster.map((m) => ({
      id: m.id,
      text: m.text,
      type: m.type,
    })),
  });

  try {
    const raw = await llm.generateJson<unknown>({
      ...prompt,
      schemaName: "MemoryConsolidation",
      schema: {
        type: "object",
        properties: {
          consolidatedText: { type: "string" },
          theme: { type: "string" },
          mergedIds: { type: "array", items: { type: "string" } },
        },
        required: ["consolidatedText", "theme", "mergedIds"],
      },
    });
    const parsed = memoryConsolidationSchema.parse(raw);
    const validIds = new Set(cluster.map((m) => m.id));
    const mergedIds = parsed.mergedIds.filter((id) => validIds.has(id));
    if (mergedIds.length < MIN_CLUSTER_SIZE) {
      return { ...parsed, mergedIds: cluster.map((m) => m.id) };
    }
    return { ...parsed, mergedIds };
  } catch {
    return fallbackConsolidation(cluster);
  }
}

export async function consolidateUserMemories(userId: string): Promise<{
  memoriesWritten: number;
  memoriesArchived: number;
}> {
  const candidates = await listConsolidationCandidates(userId);
  if (candidates.length < MIN_POOL_SIZE) {
    return { memoriesWritten: 0, memoriesArchived: 0 };
  }

  const clusters = clusterMemoriesForConsolidation(candidates);
  if (clusters.length === 0) {
    return { memoriesWritten: 0, memoriesArchived: 0 };
  }

  const memoryAdapter = getMemoryAdapter();
  let memoriesWritten = 0;
  let memoriesArchived = 0;

  for (const cluster of clusters) {
    const synthesis = await synthesizeCluster(cluster);
    const mergedIds = synthesis.mergedIds.filter((id) =>
      cluster.some((m) => m.id === id),
    );
    if (mergedIds.length < MIN_CLUSTER_SIZE) continue;

    const remembered = await memoryAdapter.remember(userId, {
      type: "consolidated_bias",
      text: synthesis.consolidatedText,
      metadata: {
        source: "sleep_cycle",
        theme: synthesis.theme,
        consolidatedFrom: mergedIds,
        consolidatedAt: new Date().toISOString(),
      },
    });

    if (!remembered.id) continue;
    memoriesWritten++;

    const archived = await archiveMemories(userId, mergedIds, {
      archived: true,
      superseded: true,
      consolidatedInto: remembered.id,
      archivedReason: "sleep_cycle",
      archivedAt: new Date().toISOString(),
    });
    memoriesArchived += archived;
  }

  if (memoriesWritten > 0) {
    await syncCloneMaturity(userId);
  }

  return { memoriesWritten, memoriesArchived };
}

export async function processMemoryConsolidation(): Promise<{
  usersProcessed: number;
  memoriesWritten: number;
  memoriesArchived: number;
}> {
  const userIds = await listUsersEligibleForConsolidation();
  let usersProcessed = 0;
  let memoriesWritten = 0;
  let memoriesArchived = 0;

  for (const userId of userIds) {
    const result = await consolidateUserMemories(userId);
    if (result.memoriesWritten > 0 || result.memoriesArchived > 0) {
      usersProcessed++;
      memoriesWritten += result.memoriesWritten;
      memoriesArchived += result.memoriesArchived;
    }
  }

  return { usersProcessed, memoriesWritten, memoriesArchived };
}
