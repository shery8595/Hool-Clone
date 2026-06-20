import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import { DEMO_SLUG } from "@/lib/db/demo-memories";
import { getEnv, isMemWalConfigured } from "@/lib/env";
import { WalrusMemoryAdapter } from "@/lib/memory/walrus-memory-adapter";

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
    const health = await new WalrusMemoryAdapter().health();
    checks.push({
      name: "Walrus relayer health",
      ok: health.ok,
      detail: health.message ?? "unknown",
    });
  }

  const demoBlobs = await query<{ count: string }>(
    `select count(*)::text as count
     from memories m
     join users u on u.id = m.user_id
     where u.public_slug = $1
       and m.metadata->>'walrusBlobId' like 'demo-blob-%'`,
    [DEMO_SLUG],
  );

  const fakeCount = Number(demoBlobs[0]?.count ?? 0);
  checks.push({
    name: "Demo memories use real blob IDs",
    ok: fakeCount === 0,
    detail:
      fakeCount === 0
        ? "No demo-blob-* placeholders"
        : `${fakeCount} memories still have placeholder blob IDs — run npm run db:seed-demo-walrus`,
  });

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

  checks.push({
    name: "Demo has Walrus-stored memories",
    ok: Number(realBlobs[0]?.count ?? 0) >= 5,
    detail: `${realBlobs[0]?.count ?? 0} real blobs on demo user`,
  });

  console.log("\nHoolClone Mainnet readiness\n");
  for (const check of checks) {
    console.log(`${check.ok ? "✓" : "✗"} ${check.name}`);
    console.log(`  ${check.detail}\n`);
  }

  const allOk = checks.every((c) => c.ok);
  if (!allOk) {
    process.exit(1);
  }

  console.log("All checks passed. Safe to record demo video.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
