import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import {
  getDemoNamespace,
  RIVAL_MEMORIES,
  RIVAL_SLUG,
} from "@/lib/db/demo-memories";
import { seedDemoRivalUser } from "@/lib/db/seed-demo-rival";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";
import { sleep } from "@/scripts/sleep";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 8_000;

async function rememberWithRetry(
  adapter: InstanceType<
    Awaited<typeof import("@/lib/memory/walrus-memory-adapter")>["WalrusMemoryAdapter"]
  >,
  userId: string,
  memory: (typeof RIVAL_MEMORIES)[number],
): Promise<{ id?: string; status: string }> {
  let last: { id?: string; status: string } = { status: "failed" };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    last = await adapter.remember(userId, {
      type: memory.type,
      text: memory.text,
      metadata: memory.metadata,
    });

    if (last.id && last.status === "stored") {
      return last;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(`  retry ${attempt}/${MAX_ATTEMPTS - 1} in ${RETRY_DELAY_MS / 1000}s…`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  return last;
}

async function main() {
  if (getEnv().MEMORY_BACKEND !== "walrus") {
    console.error("Set MEMORY_BACKEND=walrus before running this script.");
    process.exit(1);
  }

  if (!isMemWalConfigured()) {
    console.error(
      "MemWal is not configured. Set MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_PRIVATE_KEY.",
    );
    process.exit(1);
  }

  try {
    const relayer = await fetchRelayerConfig(getMemWalServerUrl());
    console.log(`Walrus relayer OK (${relayer.network})`);
  } catch (error) {
    console.error(
      "Walrus health check failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }

  const { WalrusMemoryAdapter } = await import(
    "@/lib/memory/walrus-memory-adapter"
  );

  const seeded = await seedDemoRivalUser();
  const userId = seeded.userId;
  const namespace = getDemoNamespace(RIVAL_SLUG);

  await query(`delete from memories where user_id = $1`, [userId]);

  const adapter = new WalrusMemoryAdapter();
  let stored = 0;
  let failed = 0;

  for (let i = 0; i < RIVAL_MEMORIES.length; i++) {
    const memory = RIVAL_MEMORIES[i]!;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - memory.daysAgo);

    console.log(
      `[${i + 1}/${RIVAL_MEMORIES.length}] Writing: ${memory.text.slice(0, 60)}…`,
    );

    const result = await rememberWithRetry(adapter, userId, memory);

    if (result.id && result.status === "stored") {
      await query(
        `update memories
         set public_visible = $3,
             created_at = $4
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

  console.log("\nDone.");
  console.log(`Rival user: ${userId}`);
  console.log(`Public profile: /u/${RIVAL_SLUG}`);
  console.log(`Memories stored on Walrus: ${stored}, failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
