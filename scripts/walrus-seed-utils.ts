import { query } from "@/lib/db/client";
import type { DemoMemorySeed } from "@/lib/db/demo-memories";
import { sleep } from "@/scripts/sleep";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 8_000;
/** Stay under MemWal delegate limit (30 weighted-requests/min). */
export const INTER_WRITE_DELAY_MS = 25_000;

export function parseRateLimitWaitMs(message: string): number | null {
  const match = message.match(/retry_after_seconds":(\d+)/);
  if (match) return Number(match[1]) * 1000;
  if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
    return 300_000;
  }
  return null;
}

async function getWalrusErrorForMemory(memoryId: string): Promise<string | null> {
  const rows = await query<{ error: string | null }>(
    `select metadata->>'walrusError' as error from memories where id = $1`,
    [memoryId],
  );
  return rows[0]?.error ?? null;
}

export async function waitForWalrusRateLimit(): Promise<void> {
  const rows = await query<{ error: string | null }>(
    `select metadata->>'walrusError' as error
     from memories
     where storage_status = 'failed'
       and metadata->>'walrusError' like '%429%'
     order by created_at desc
     limit 1`,
  );
  const error = rows[0]?.error;
  if (!error) return;

  const waitMs = parseRateLimitWaitMs(error);
  if (!waitMs) return;

  console.log(
    `Walrus rate limit detected — waiting ${Math.ceil(waitMs / 1000)}s before uploading…`,
  );
  await sleep(waitMs);
}

export async function rememberWithRetry(
  adapter: InstanceType<
    Awaited<typeof import("@/lib/memory/walrus-memory-adapter")>["WalrusMemoryAdapter"]
  >,
  userId: string,
  memory: DemoMemorySeed,
): Promise<{ id?: string; status: string; error?: string }> {
  let last: { id?: string; status: string; error?: string } = { status: "failed" };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt === 1) {
      console.log("  uploading to Walrus (may take 1–2 min)…");
    } else {
      console.log(`  retry ${attempt}/${MAX_ATTEMPTS}…`);
    }

    last = await adapter.remember(userId, {
      type: memory.type,
      text: memory.text,
      metadata: memory.metadata,
    });

    if (last.id && last.status === "stored") {
      return last;
    }

    const walrusError = last.id ? await getWalrusErrorForMemory(last.id) : null;
    if (walrusError) {
      last.error = walrusError;
      console.error(`  error: ${walrusError.slice(0, 120)}`);
      const rateWait = parseRateLimitWaitMs(walrusError);
      if (rateWait && attempt < MAX_ATTEMPTS) {
        console.log(`  rate limited — waiting ${Math.ceil(rateWait / 1000)}s…`);
        await sleep(rateWait);
        continue;
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(`  waiting ${RETRY_DELAY_MS / 1000}s before retry…`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  return last;
}

async function findStoredMemory(
  userId: string,
  text: string,
): Promise<{ id: string } | null> {
  const rows = await query<{ id: string }>(
    `select id from memories
     where user_id = $1
       and text = $2
       and storage_status = 'stored'
       and metadata->>'walrusBlobId' is not null
       and metadata->>'walrusBlobId' not like 'demo-blob-%'
       and metadata->>'walrusBlobId' not like 'rival-blob-%'
     limit 1`,
    [userId, text],
  );
  return rows[0] ?? null;
}

export async function listMissingSeedMemories(
  userId: string,
  memories: DemoMemorySeed[],
): Promise<DemoMemorySeed[]> {
  const missing: DemoMemorySeed[] = [];
  for (const memory of memories) {
    const existing = await findStoredMemory(userId, memory.text);
    if (!existing) missing.push(memory);
  }
  return missing;
}

export async function uploadMissingMemoriesToWalrus(options: {
  userId: string;
  namespace: string;
  memories: DemoMemorySeed[];
}): Promise<{ stored: number; failed: number; skipped: number }> {
  const { userId, namespace, memories } = options;

  const placeholders = await deletePlaceholderMemories(userId);
  if (placeholders > 0) {
    console.log(`  removed ${placeholders} placeholder row(s)`);
  }

  await query(
    `delete from memories
     where user_id = $1 and storage_status != 'stored'`,
    [userId],
  );

  const missing = await listMissingSeedMemories(userId, memories);
  const skipped = memories.length - missing.length;

  if (skipped > 0) {
    console.log(`  ${skipped} already on Walrus — skipping`);
  }

  if (missing.length === 0) {
    console.log("  nothing to upload");
    return { stored: 0, failed: 0, skipped };
  }

  console.log(`  uploading ${missing.length} missing memor${missing.length === 1 ? "y" : "ies"}…`);

  const { WalrusMemoryAdapter } = await import(
    "@/lib/memory/walrus-memory-adapter"
  );
  const adapter = new WalrusMemoryAdapter();

  let stored = 0;
  let failed = 0;

  for (let i = 0; i < missing.length; i++) {
    const memory = missing[i]!;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - memory.daysAgo);

    console.log(`[${i + 1}/${missing.length}] ${memory.text.slice(0, 60)}…`);

    await query(
      `delete from memories
       where user_id = $1
         and text = $2
         and (
           storage_status != 'stored'
           or metadata->>'walrusBlobId' like 'demo-blob-%'
           or metadata->>'walrusBlobId' like 'rival-blob-%'
         )`,
      [userId, memory.text],
    );

    const result = await rememberWithRetry(adapter, userId, memory);

    if (result.id && result.status === "stored") {
      await query(
        `update memories
         set public_visible = $3, created_at = $4
         where id = $1 and user_id = $2`,
        [result.id, userId, memory.publicVisible ?? true, createdAt.toISOString()],
      );
      stored += 1;
      console.log(`  stored (${namespace})`);
    } else {
      failed += 1;
      console.error(`  failed: status=${result.status}`);
    }
  }

  return { stored, failed, skipped };
}

export async function seedMemoriesToWalrus(options: {
  userId: string;
  namespace: string;
  memories: DemoMemorySeed[];
  resume?: boolean;
}): Promise<{ stored: number; failed: number; skipped: number }> {
  const { userId, namespace, memories, resume = false } = options;

  if (resume) {
    return uploadMissingMemoriesToWalrus({ userId, namespace, memories });
  }

  await query(`delete from memories where user_id = $1`, [userId]);

  const { WalrusMemoryAdapter } = await import(
    "@/lib/memory/walrus-memory-adapter"
  );
  const adapter = new WalrusMemoryAdapter();

  let stored = 0;
  let failed = 0;

  for (let i = 0; i < memories.length; i++) {
    const memory = memories[i]!;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - memory.daysAgo);

    console.log(
      `[${i + 1}/${memories.length}] ${memory.text.slice(0, 60)}…`,
    );

    const result = await rememberWithRetry(adapter, userId, memory);

    if (result.id && result.status === "stored") {
      await query(
        `update memories
         set public_visible = $3, created_at = $4
         where id = $1 and user_id = $2`,
        [result.id, userId, memory.publicVisible ?? true, createdAt.toISOString()],
      );
      stored += 1;
      console.log(`  stored (${namespace})`);
    } else {
      failed += 1;
      console.error(`  failed: status=${result.status}`);
    }
  }

  return { stored, failed, skipped: 0 };
}

export async function deletePlaceholderMemories(userId: string): Promise<number> {
  const rows = await query<{ id: string }>(
    `delete from memories
     where user_id = $1
       and (
         metadata->>'walrusBlobId' like 'demo-blob-%'
         or metadata->>'walrusBlobId' like 'rival-blob-%'
       )
     returning id`,
    [userId],
  );
  return rows.length;
}

export async function countStoredRealBlobs(userId: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `select count(*)::text as count from memories
     where user_id = $1
       and storage_status = 'stored'
       and metadata->>'walrusBlobId' is not null
       and metadata->>'walrusBlobId' not like 'demo-blob-%'
       and metadata->>'walrusBlobId' not like 'rival-blob-%'`,
    [userId],
  );
  return Number(rows[0]?.count ?? 0);
}

export function parseResumeFlag(): boolean {
  return process.argv.includes("--resume");
}
