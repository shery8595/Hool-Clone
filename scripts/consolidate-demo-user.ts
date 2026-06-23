import { loadEnv } from "@/lib/load-env";

loadEnv();

import { queryOne } from "@/lib/db/client";
import { DEMO_SLUG } from "@/lib/db/demo-memories";
import { consolidateUserMemories } from "@/lib/memory/consolidate-memories";

async function main() {
  const row = await queryOne<{ id: string }>(
    `select id from users where public_slug = $1`,
    [DEMO_SLUG],
  );

  if (!row) {
    console.error(`Demo user not found (slug: ${DEMO_SLUG}). Run db:seed-demo first.`);
    process.exit(1);
  }

  console.log(`Running sleep-cycle consolidation for demo user ${row.id}…`);
  const result = await consolidateUserMemories(row.id);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
