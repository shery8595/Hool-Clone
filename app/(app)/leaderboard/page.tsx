import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { getOptionalUserId } from "@/lib/auth/require-user";
import { buildLeaderboard } from "@/lib/leaderboard/build-leaderboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard · HoolClone",
  description:
    "Global rankings by memories stored and how closely your clone mirrors your picks.",
};

const getLeaderboardData = unstable_cache(
  async (viewerUserId: string | null) =>
    buildLeaderboard(viewerUserId),
  ["leaderboard-data"],
  { revalidate: 60 },
);

export default async function LeaderboardPage() {
  const viewerUserId = await getOptionalUserId();
  const data = await getLeaderboardData(viewerUserId);

  return (
    <LeaderboardView data={data} serverViewerUserId={viewerUserId} />
  );
}
