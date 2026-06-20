import { loadEnv } from "@/lib/load-env";
import { readFileSync } from "node:fs";

loadEnv();
import { resolve } from "node:path";
import { Pool } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const schemaPath = resolve(process.cwd(), "lib/db/schema.sql");
  const sql = readFileSync(schemaPath, "utf8");

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query(sql);
    console.log("Migration complete.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
