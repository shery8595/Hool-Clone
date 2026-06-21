import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query, queryOne } from "@/lib/db/client";
import {
  DEMO_MEMORIES,
  DEMO_SLUG,
  getDemoNamespace,
} from "@/lib/db/demo-memories";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";
import { sleep } from "@/scripts/sleep";

async function main() {
  if (getEnv().MEMORY_BACKEND !== "walrus" || !isMemWalConfigured()) {
    console.error("Walrus backend not configured.");
    process.exit(1);
  }

  await fetchRelayerConfig(getMemWalServerUrl());

  const user = await queryOne<{ id: string }>(
    `select id from users where public_slug = $1`,
    [DEMO_SLUG],
  );
  if (!user) {
    console.error("Demo user not found.");
    process.exit(1);
  }

  const failed = await query<{ id: string; text: string }>(
    `select id, text from memories
     where user_id = $1 and storage_status != 'stored'`,
    [user.id],
  );

  if (failed.length === 0) {
    console.log("No failed memories to retry.");
    return;
  }

  const { WalrusMemoryAdapter } = await import(
    "@/lib/memory/walrus-memory-adapter"
  );
  const adapter = new WalrusMemoryAdapter();
  const namespace = getDemoNamespace(DEMO_SLUG);

  for (const row of failed) {
    const seed = DEMO_MEMORIES.find((m) => m.text === row.text);
    if (!seed) {
      console.warn(`No seed match for: ${row.text.slice(0, 50)}…`);
      continue;
    }

    await query(`delete from memories where id = $1`, [row.id]);

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - seed.daysAgo);

    console.log(`Retrying: ${seed.text.slice(0, 60)}…`);

    let result: { id?: string; status: string } = { status: "failed" };
    for (let attempt = 1; attempt <= 3; attempt++) {
      result = await adapter.remember(user.id, {
        type: seed.type,
        text: seed.text,
        metadata: seed.metadata,
      });
      if (result.id && result.status === "stored") break;
      if (attempt < 3) await sleep(8_000);
    }

    if (result.id && result.status === "stored") {
      await query(
        `update memories
         set public_visible = $3, created_at = $4
         where id = $1 and user_id = $2`,
        [result.id, user.id, seed.publicVisible ?? true, createdAt.toISOString()],
      );
      console.log(`  stored (${namespace})`);
    } else {
      console.error(`  still failed: status=${result.status}`);
      process.exit(1);
    }
  }

  console.log("Retry complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
