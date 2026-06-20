import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import {
  DEMO_MEMORIES,
  DEMO_SLUG,
  getDemoNamespace,
} from "@/lib/db/demo-memories";
import { seedDemoUser } from "@/lib/db/seed-demo-user";
import { getEnv, isMemWalConfigured } from "@/lib/env";
import { WalrusMemoryAdapter } from "@/lib/memory/walrus-memory-adapter";

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

  const health = await new WalrusMemoryAdapter().health();
  if (!health.ok) {
    console.error("Walrus health check failed:", health.message);
    process.exit(1);
  }

  console.log("Walrus OK:", health.message);

  const seeded = await seedDemoUser();
  const userId = seeded.userId;
  const namespace = getDemoNamespace(DEMO_SLUG);

  await query(`delete from memories where user_id = $1`, [userId]);

  const adapter = new WalrusMemoryAdapter();
  let stored = 0;
  let failed = 0;

  for (let i = 0; i < DEMO_MEMORIES.length; i++) {
    const memory = DEMO_MEMORIES[i]!;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - memory.daysAgo);

    console.log(
      `[${i + 1}/${DEMO_MEMORIES.length}] Writing: ${memory.text.slice(0, 60)}…`,
    );

    const result = await adapter.remember(userId, {
      type: memory.type,
      text: memory.text,
      metadata: memory.metadata,
    });

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
  console.log(`Demo user: ${userId}`);
  console.log(`Public profile: /u/${DEMO_SLUG}`);
  console.log(`Memories stored on Walrus: ${stored}, failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
