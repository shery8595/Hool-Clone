import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import { DEMO_SLUG } from "@/lib/db/demo-memories";
import { getEnv, getMemWalServerUrl, isMemWalConfigured } from "@/lib/env";
import { fetchRelayerConfig } from "@/lib/memwal/contract-config";

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

  let fakeCount = 0;
  let realCount = 0;

  try {
    const demoBlobs = await query<{ count: string }>(
      `select count(*)::text as count
       from memories m
       join users u on u.id = m.user_id
       where u.public_slug = $1
         and m.metadata->>'walrusBlobId' like 'demo-blob-%'`,
      [DEMO_SLUG],
    );
    fakeCount = Number(demoBlobs[0]?.count ?? 0);

    const realBlobs = await query<{ count: string }>(
      `select count(*)::text as count
       from memories m
       join users u on u.id = m.user_id
       where u.public_slug = $1
         and m.storage_status = 'stored'
         and m.metadata->>'walrusBlobId' is not null
         and m.metadata->>'walrusBlobId' not like 'demo-blob-%'`,
      [DEMO_SLUG],
    );
    realCount = Number(realBlobs[0]?.count ?? 0);
  } catch (error) {
    checks.push({
      name: "Database reachable",
      ok: false,
      detail: error instanceof Error ? error.message : "DB query failed",
    });
  }

  if (checks.every((c) => c.name !== "Database reachable")) {
    checks.push({
      name: "Demo memories use real blob IDs",
      ok: fakeCount === 0,
      detail:
        fakeCount === 0
          ? "No demo-blob-* placeholders"
          : `${fakeCount} memories still have placeholder blob IDs — run npm run db:seed-demo-walrus`,
    });

    checks.push({
      name: "Demo has Walrus-stored memories",
      ok: realCount >= 5,
      detail: `${realCount} real blobs on demo user (/u/${DEMO_SLUG})`,
    });
  }

  console.log("\nHoolClone Mainnet readiness\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}`);
    console.log(`  ${check.detail}\n`);
  }

  const allOk = checks.every((c) => c.ok);
  if (!allOk) {
    console.log(
      "Some checks failed. Set MEMORY_BACKEND=walrus, run memwal:setup, then db:seed-demo-walrus before recording the demo.",
    );
    process.exit(1);
  }

  console.log("All checks passed. Safe to record demo video.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
