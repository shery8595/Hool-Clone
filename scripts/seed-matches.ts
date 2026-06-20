import { loadEnv } from "@/lib/load-env";
import { seedMatches } from "@/lib/db/seed-matches";

loadEnv();

async function main() {
  const result = await seedMatches();
  console.log(
    `Seeded ${result.total} matches (${result.inserted} new, ${result.total - result.inserted} updated).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
