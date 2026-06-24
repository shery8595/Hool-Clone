import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import {
  DEMO_MEMORIES,
  DEMO_SLUG,
  getDemoNamespace,
  RIVAL_MEMORIES,
  RIVAL_SLUG,
  type DemoMemorySeed,
} from "@/lib/db/demo-memories";
import { seedDemoUser } from "@/lib/db/seed-demo-user";
import { seedDemoRivalUser } from "@/lib/db/seed-demo-rival";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";
import {
  countStoredRealBlobs,
  INTER_WRITE_DELAY_MS,
  listMissingSeedMemories,
  rememberWithRetry,
  waitForWalrusRateLimit,
} from "@/scripts/walrus-seed-utils";
import { sleep } from "@/scripts/sleep";

const RIVAL_TOP_UP = RIVAL_MEMORIES.slice(-4);

async function demoTopUpMemories(userId: string): Promise<DemoMemorySeed[]> {
  const stored = await countStoredRealBlobs(userId);
  if (stored >= 9) {
    return DEMO_MEMORIES.slice(-1);
  }

  const missing = await listMissingSeedMemories(userId, DEMO_MEMORIES);
  console.log(
    `  demo has ${stored}/10 on Walrus — will upload all ${missing.length} missing (not just the last one)`,
  );
  return missing;
}

async function rivalTopUpMemories(userId: string): Promise<DemoMemorySeed[]> {
  const missing = await listMissingSeedMemories(userId, RIVAL_TOP_UP);
  return missing;
}

async function hasStoredRealMemory(userId: string, text: string): Promise<boolean> {
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
  return rows.length > 0;
}

async function clearOnlyThisMemory(userId: string, text: string): Promise<void> {
  await query(
    `delete from memories
     where user_id = $1
       and text = $2
       and (
         storage_status != 'stored'
         or metadata->>'walrusBlobId' like 'demo-blob-%'
         or metadata->>'walrusBlobId' like 'rival-blob-%'
       )`,
    [userId, text],
  );
}

async function writeTopUp(options: {
  label: string;
  userId: string;
  namespace: string;
  memories: DemoMemorySeed[];
}) {
  const { WalrusMemoryAdapter } = await import(
    "@/lib/memory/walrus-memory-adapter"
  );
  const adapter = new WalrusMemoryAdapter();

  let stored = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\n${options.label}: uploading only ${options.memories.length} selected memor${options.memories.length === 1 ? "y" : "ies"}`);

  for (let i = 0; i < options.memories.length; i++) {
    const memory = options.memories[i]!;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - memory.daysAgo);

    console.log(`[${i + 1}/${options.memories.length}] ${memory.text.slice(0, 72)}…`);

    if (await hasStoredRealMemory(options.userId, memory.text)) {
      skipped += 1;
      console.log("  skip (already on Walrus)");
      continue;
    }

    await clearOnlyThisMemory(options.userId, memory.text);
    const result = await rememberWithRetry(adapter, options.userId, memory);

    if (result.id && result.status === "stored") {
      await query(
        `update memories
         set public_visible = $3, created_at = $4
         where id = $1 and user_id = $2`,
        [
          result.id,
          options.userId,
          memory.publicVisible ?? true,
          createdAt.toISOString(),
        ],
      );
      stored += 1;
      console.log(`  stored (${options.namespace})`);
      if (i < options.memories.length - 1) {
        console.log(`  pacing ${INTER_WRITE_DELAY_MS / 1000}s before next write…`);
        await sleep(INTER_WRITE_DELAY_MS);
      }
    } else {
      failed += 1;
      const detail = result.error ? ` — ${result.error.slice(0, 100)}` : "";
      console.error(`  failed: status=${result.status}${detail}`);
      if (result.error && result.error.includes("429")) {
        console.log("  stopping early — Walrus rate limit. Re-run this script in 5 minutes.");
        break;
      }
    }
  }

  return { stored, skipped, failed };
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

  const relayer = await fetchRelayerConfig(getMemWalServerUrl());
  console.log(`Walrus relayer OK (${relayer.network})`);
  await waitForWalrusRateLimit();

  const demo = await seedDemoUser({ touchMemories: false });
  const rival = await seedDemoRivalUser({ touchMemories: false });

  const demoMemories = await demoTopUpMemories(demo.userId);
  const rivalMemories = await rivalTopUpMemories(rival.userId);

  console.log(
    `Plan: up to ${demoMemories.length} demo + ${rivalMemories.length} rival upload(s)`,
  );

  const demoResult = await writeTopUp({
    label: `Demo (/u/${DEMO_SLUG})`,
    userId: demo.userId,
    namespace: getDemoNamespace(DEMO_SLUG),
    memories: demoMemories,
  });

  const rivalResult =
    demoResult.failed > 0
      ? { stored: 0, skipped: 0, failed: 0 }
      : await writeTopUp({
          label: `Rival (/u/${RIVAL_SLUG})`,
          userId: rival.userId,
          namespace: getDemoNamespace(RIVAL_SLUG),
          memories: rivalMemories,
        });

  console.log("\nSummary");
  console.log(
    `  Demo selected:  +${demoResult.stored} new, ${demoResult.skipped} skipped, ${demoResult.failed} failed`,
  );
  console.log(
    `  Rival selected: +${rivalResult.stored} new, ${rivalResult.skipped} skipped, ${rivalResult.failed} failed`,
  );

  if (demoResult.failed > 0 || rivalResult.failed > 0) {
    console.log("\nRe-run: npm run db:top-up-walrus");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
