import { loadEnv } from "@/lib/load-env";

loadEnv();

import {
  getDemoNamespace,
  RIVAL_MEMORIES,
  RIVAL_SLUG,
} from "@/lib/db/demo-memories";
import { seedDemoRivalUser } from "@/lib/db/seed-demo-rival";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";
import {
  parseResumeFlag,
  seedMemoriesToWalrus,
} from "@/scripts/walrus-seed-utils";

async function main() {
  const resume = parseResumeFlag();

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

  const seeded = await seedDemoRivalUser({ touchMemories: false });
  const userId = seeded.userId;
  const namespace = getDemoNamespace(RIVAL_SLUG);

  const { stored, failed, skipped } = await seedMemoriesToWalrus({
    userId,
    namespace,
    memories: RIVAL_MEMORIES,
    resume,
  });

  console.log("\nDone.");
  console.log(`Rival user: ${userId}`);
  console.log(`Public profile: /u/${RIVAL_SLUG}`);
  console.log(
    `Memories: ${stored} new, ${skipped} skipped, ${failed} failed (${RIVAL_MEMORIES.length} expected)`,
  );

  if (failed > 0) {
    console.log("\nRe-run with: npm run db:seed-demo-rival-walrus:resume");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
