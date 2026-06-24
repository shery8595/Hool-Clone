import { loadEnv } from "@/lib/load-env";

loadEnv();

import {
  DEMO_MEMORIES,
  DEMO_SLUG,
  getDemoNamespace,
  RIVAL_MEMORIES,
  RIVAL_SLUG,
} from "@/lib/db/demo-memories";
import { seedDemoUser } from "@/lib/db/seed-demo-user";
import { seedDemoRivalUser } from "@/lib/db/seed-demo-rival";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";
import {
  countStoredRealBlobs,
  listMissingSeedMemories,
  uploadMissingMemoriesToWalrus,
} from "@/scripts/walrus-seed-utils";

const DEMO_TARGET = DEMO_MEMORIES.length;
const RIVAL_TARGET = RIVAL_MEMORIES.length;

async function topUpUser(options: {
  label: string;
  slug: string;
  userId: string;
  namespace: string;
  memories: typeof DEMO_MEMORIES;
  target: number;
}) {
  const before = await countStoredRealBlobs(options.userId);
  const missing = await listMissingSeedMemories(options.userId, options.memories);

  console.log(
    `\n${options.label} (/u/${options.slug}): ${before}/${options.target} on Walrus`,
  );

  if (missing.length === 0) {
    console.log("  complete — nothing to upload");
    return { stored: 0, failed: 0, skipped: options.target };
  }

  console.log(`  will upload ${missing.length} missing only:`);
  for (const memory of missing) {
    console.log(`    · ${memory.text.slice(0, 72)}…`);
  }

  return uploadMissingMemoriesToWalrus({
    userId: options.userId,
    namespace: options.namespace,
    memories: options.memories,
  });
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
  console.log(`Targets: demo ${DEMO_TARGET}, rival ${RIVAL_TARGET}`);

  const demo = await seedDemoUser({ touchMemories: false });
  const rival = await seedDemoRivalUser({ touchMemories: false });

  const demoResult = await topUpUser({
    label: "Demo",
    slug: DEMO_SLUG,
    userId: demo.userId,
    namespace: getDemoNamespace(DEMO_SLUG),
    memories: DEMO_MEMORIES,
    target: DEMO_TARGET,
  });

  const rivalResult = await topUpUser({
    label: "Rival",
    slug: RIVAL_SLUG,
    userId: rival.userId,
    namespace: getDemoNamespace(RIVAL_SLUG),
    memories: RIVAL_MEMORIES,
    target: RIVAL_TARGET,
  });

  const demoAfter = await countStoredRealBlobs(demo.userId);
  const rivalAfter = await countStoredRealBlobs(rival.userId);

  console.log("\nSummary");
  console.log(
    `  Demo:  ${demoAfter}/${DEMO_TARGET} (+${demoResult.stored} new, ${demoResult.skipped} skipped, ${demoResult.failed} failed)`,
  );
  console.log(
    `  Rival: ${rivalAfter}/${RIVAL_TARGET} (+${rivalResult.stored} new, ${rivalResult.skipped} skipped, ${rivalResult.failed} failed)`,
  );

  if (demoResult.failed > 0 || rivalResult.failed > 0) {
    console.log("\nRe-run: npm run db:top-up-walrus");
    process.exit(1);
  }

  if (demoAfter < DEMO_TARGET || rivalAfter < RIVAL_TARGET) {
    console.log("\nStill short — re-run: npm run db:top-up-walrus");
    process.exit(1);
  }

  console.log("\nBoth profiles at target. Run: npm run verify:mainnet");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
