import { loadEnv } from "@/lib/load-env";
import { seedMatches } from "@/lib/db/seed-matches";
import { syncMatchResultsFromApi } from "@/lib/match-data/sync-match-results";

loadEnv();

async function main() {
  const result = await seedMatches();
  console.log(
    `Seeded ${result.total} matches (${result.inserted} new, ${result.total - result.inserted} updated).`,
  );

  const sync = await syncMatchResultsFromApi();
  console.log(
    `Synced scores from API: ${sync.matched} matched, ${sync.updated} updated, ${sync.fixturesFetched} fixtures fetched.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
