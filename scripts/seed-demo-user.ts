import { loadEnv } from "@/lib/load-env";
import { seedMatches } from "@/lib/db/seed-matches";
import { seedDemoUser } from "@/lib/db/seed-demo-user";
import { seedDemoRivalUser } from "@/lib/db/seed-demo-rival";
import { DEMO_SLUG, RIVAL_SLUG } from "@/lib/db/demo-memories";

loadEnv();

async function main() {
  await seedMatches();
  const result = await seedDemoUser();
  const rival = await seedDemoRivalUser();
  console.log(
    `Demo user ready: /u/${result.slug} (${result.memoriesInserted} memories, ${result.predictionsInserted} predictions).`,
  );
  console.log(
    `Rival user ready: /u/${rival.slug} (${rival.memoriesInserted} memories). Clone clash: /u/${DEMO_SLUG}/clash?opponent=${RIVAL_SLUG}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
