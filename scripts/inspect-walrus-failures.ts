import { loadEnv } from "@/lib/load-env";
loadEnv();
import { query } from "@/lib/db/client";

async function main() {
  const rows = await query<{
    public_slug: string;
    text: string;
    storage_status: string;
    walrus_error: string | null;
    walrus_blob_id: string | null;
    created_at: string;
  }>(
    `select u.public_slug,
            left(m.text, 80) as text,
            m.storage_status,
            m.metadata->>'walrusError' as walrus_error,
            m.metadata->>'walrusBlobId' as walrus_blob_id,
            m.created_at::text
     from memories m
     join users u on u.id = m.user_id
     where u.public_slug in ('hoolclone-demo', 'hoolclone-rival')
       and (
         m.storage_status != 'stored'
         or m.metadata->>'walrusBlobId' like 'demo-blob-%'
         or m.metadata->>'walrusBlobId' like 'rival-blob-%'
       )
     order by u.public_slug, m.created_at desc
     limit 30`,
  );

  const counts = await query<{ public_slug: string; stored: number; failed: number; pending: number }>(
    `select u.public_slug,
            count(*) filter (where m.storage_status = 'stored'
              and m.metadata->>'walrusBlobId' is not null
              and m.metadata->>'walrusBlobId' not like 'demo-blob-%'
              and m.metadata->>'walrusBlobId' not like 'rival-blob-%')::int as stored,
            count(*) filter (where m.storage_status = 'failed')::int as failed,
            count(*) filter (where m.storage_status = 'pending')::int as pending
     from memories m
     join users u on u.id = m.user_id
     where u.public_slug in ('hoolclone-demo', 'hoolclone-rival')
     group by u.public_slug`,
  );

  console.log("Counts:");
  for (const row of counts) {
    console.log(`  ${row.public_slug}: ${row.stored} stored, ${row.failed} failed, ${row.pending} pending`);
  }

  console.log("\nRecent failures / non-real rows:");
  for (const row of rows) {
    console.log(`\n[${row.public_slug}] ${row.storage_status}`);
    console.log(`  text: ${row.text}`);
    console.log(`  blob: ${row.walrus_blob_id ?? "—"}`);
    console.log(`  error: ${row.walrus_error ?? "—"}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
