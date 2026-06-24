import { loadEnv } from "@/lib/load-env";

loadEnv();

import { query } from "@/lib/db/client";
import { DEMO_SLUG, RIVAL_SLUG } from "@/lib/db/demo-memories";
import { countStoredRealBlobs } from "@/scripts/walrus-seed-utils";

async function main() {
  const deleted = await query<{ id: string; public_slug: string }>(
    `delete from memories m
     using users u
     where m.user_id = u.id
       and u.public_slug in ($1, $2)
       and m.storage_status != 'stored'
     returning m.id, u.public_slug`,
    [DEMO_SLUG, RIVAL_SLUG],
  );

  const bySlug = new Map<string, number>();
  for (const row of deleted) {
    bySlug.set(row.public_slug, (bySlug.get(row.public_slug) ?? 0) + 1);
  }

  console.log(`Deleted ${deleted.length} non-stored row(s).`);
  for (const slug of [DEMO_SLUG, RIVAL_SLUG]) {
    const user = await query<{ id: string }>(
      `select id from users where public_slug = $1`,
      [slug],
    );
    const userId = user[0]?.id;
    const stored = userId ? await countStoredRealBlobs(userId) : 0;
    console.log(
      `  /u/${slug}: removed ${bySlug.get(slug) ?? 0} failed — ${stored} real blobs remain`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
