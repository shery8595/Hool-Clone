import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import { DEMO_SLUG, RIVAL_SLUG } from "@/lib/db/demo-memories";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";

const DEMO_MIN_BLOBS = 15;
const RIVAL_MIN_BLOBS = 5;

async function countPlaceholderBlobs(slug: string, prefix: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `select count(*)::text as count
     from memories m
     join users u on u.id = m.user_id
     where u.public_slug = $1
       and m.metadata->>'walrusBlobId' like $2`,
    [slug, `${prefix}%`],
  );
  return Number(rows[0]?.count ?? 0);
}

async function countRealBlobs(slug: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `select count(*)::text as count
     from memories m
     join users u on u.id = m.user_id
     where u.public_slug = $1
       and m.storage_status = 'stored'
       and m.metadata->>'walrusBlobId' is not null
       and m.metadata->>'walrusBlobId' not like 'demo-blob-%'
       and m.metadata->>'walrusBlobId' not like 'rival-blob-%'`,
    [slug],
  );
  return Number(rows[0]?.count ?? 0);
}

async function countNonStored(slug: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `select count(*)::text as count
     from memories m
     join users u on u.id = m.user_id
     where u.public_slug = $1
       and m.storage_status != 'stored'`,
    [slug],
  );
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  checks.push({
    name: "MEMORY_BACKEND=walrus",
    ok: getEnv().MEMORY_BACKEND === "walrus",
    detail: `current: ${getEnv().MEMORY_BACKEND}`,
  });

  checks.push({
    name: "MemWal configured",
    ok: isMemWalConfigured(),
    detail: isMemWalConfigured()
      ? "MEMWAL_ACCOUNT_ID + delegate key set"
      : "Missing MEMWAL_ACCOUNT_ID or MEMWAL_DELEGATE_PRIVATE_KEY",
  });

  if (isMemWalConfigured()) {
    try {
      const relayer = await fetchRelayerConfig(getMemWalServerUrl());
      checks.push({
        name: "Walrus relayer health",
        ok: true,
        detail: `Relayer reachable (${relayer.network}, package ${relayer.packageId.slice(0, 10)}…)`,
      });
    } catch (error) {
      checks.push({
        name: "Walrus relayer health",
        ok: false,
        detail: error instanceof Error ? error.message : "Health check failed",
      });
    }
  }

  let dbOk = true;

  try {
    const demoFake = await countPlaceholderBlobs(DEMO_SLUG, "demo-blob-");
    const demoReal = await countRealBlobs(DEMO_SLUG);
    const demoPending = await countNonStored(DEMO_SLUG);

    checks.push({
      name: "Demo memories use real blob IDs",
      ok: demoFake === 0,
      detail:
        demoFake === 0
          ? "No demo-blob-* placeholders"
          : `${demoFake} memories still have placeholder blob IDs — run npm run db:seed-demo-walrus`,
    });

    checks.push({
      name: "Demo has Walrus-stored memories",
      ok: demoReal >= DEMO_MIN_BLOBS,
      detail: `${demoReal} real blobs on demo user (/u/${DEMO_SLUG})`,
    });

    if (demoPending > 0) {
      checks.push({
        name: "Demo memories all stored",
        ok: false,
        detail: `${demoPending} memories not in stored status`,
      });
    }

    const rivalFake = await countPlaceholderBlobs(RIVAL_SLUG, "rival-blob-");
    const rivalReal = await countRealBlobs(RIVAL_SLUG);
    const rivalPending = await countNonStored(RIVAL_SLUG);

    checks.push({
      name: "Rival memories use real blob IDs",
      ok: rivalFake === 0,
      detail:
        rivalFake === 0
          ? "No rival-blob-* placeholders"
          : `${rivalFake} rival memories still have placeholder blob IDs — run npm run db:seed-demo-rival-walrus`,
    });

    checks.push({
      name: "Rival has Walrus-stored memories",
      ok: rivalReal >= RIVAL_MIN_BLOBS,
      detail: `${rivalReal} real blobs on rival user (/u/${RIVAL_SLUG})`,
    });

    if (rivalPending > 0) {
      checks.push({
        name: "Rival memories all stored",
        ok: false,
        detail: `${rivalPending} rival memories not in stored status`,
      });
    }
  } catch (error) {
    dbOk = false;
    checks.push({
      name: "Database reachable",
      ok: false,
      detail: error instanceof Error ? error.message : "DB query failed",
    });
  }

  if (!dbOk) {
    // already pushed DB error
  }

  console.log("\nHoolClone Mainnet readiness\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}`);
    console.log(`  ${check.detail}\n`);
  }

  const allOk = checks.every((c) => c.ok);
  if (!allOk) {
    console.log(
      "Some checks failed. Set MEMORY_BACKEND=walrus, run memwal:setup, then db:seed-demo-walrus and db:seed-demo-rival-walrus before recording the demo.",
    );
    process.exit(1);
  }

  console.log("All checks passed. Safe to record demo video.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
