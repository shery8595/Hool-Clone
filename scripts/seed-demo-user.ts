import { loadEnv } from "@/lib/load-env";
import { seedMatches } from "@/lib/db/seed-matches";
import { seedDemoUser } from "@/lib/db/seed-demo-user";

loadEnv();

async function main() {
  await seedMatches();
  const result = await seedDemoUser();
  console.log(
    `Demo user ready: /u/${result.slug} (${result.memoriesInserted} memories, ${result.predictionsInserted} predictions).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
