import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { ArenaView } from "@/components/arena/arena-view";
import { getOptionalUserId } from "@/lib/auth/require-user";
import { buildLeaderboard } from "@/lib/leaderboard/build-leaderboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clone Arena · HoolClone",
  description:
    "Challenge leaderboard clones in Walrus-backed namespace vs namespace debates.",
};

const getArenaData = unstable_cache(
  async (viewerUserId: string | null) => buildLeaderboard(viewerUserId),
  ["arena-leaderboard-data"],
  { revalidate: 60 },
);

export default async function ArenaPage() {
  const viewerUserId = await getOptionalUserId();
  const data = await getArenaData(viewerUserId);

  return <ArenaView data={data} serverViewerUserId={viewerUserId} />;
}
