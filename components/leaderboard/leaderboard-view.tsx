"use client";

import { useUser } from "@/components/providers/user-provider";
import { LeaderboardPageHeader } from "@/components/leaderboard/leaderboard-page-header";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import type { LeaderboardData } from "@/lib/leaderboard/types";

type LeaderboardViewProps = {
  data: LeaderboardData;
  serverViewerUserId: string | null;
};

export function LeaderboardView({
  data,
  serverViewerUserId,
}: LeaderboardViewProps) {
  const { me } = useUser();
  const viewerUserId = serverViewerUserId ?? me?.id ?? null;
  const viewerEntry = viewerUserId
    ? (data.entries.find((entry) => entry.userId === viewerUserId) ?? null)
    : null;

  const viewData: LeaderboardData = {
    ...data,
    viewerEntry,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <LeaderboardPageHeader data={viewData} />
      <LeaderboardTable
        entries={data.entries}
        viewerUserId={viewerUserId}
      />
    </div>
  );
}
