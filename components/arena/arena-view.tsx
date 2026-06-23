"use client";

import { useUser } from "@/components/providers/user-provider";
import { ArenaHero } from "@/components/arena/arena-hero";
import { ArenaOpponentGrid } from "@/components/arena/arena-opponent-grid";
import {
  ArenaQuickMatch,
} from "@/components/arena/arena-opponent-card";
import { ArenaRecentBouts } from "@/components/arena/arena-recent-bouts";
import {
  pickQuickMatch,
  suggestOpponents,
} from "@/lib/clash/arena-opponents";
import type { LeaderboardData } from "@/lib/leaderboard/types";

type ArenaViewProps = {
  data: LeaderboardData;
  serverViewerUserId: string | null;
};

export function ArenaView({ data, serverViewerUserId }: ArenaViewProps) {
  const { me } = useUser();
  const viewerUserId = serverViewerUserId ?? me?.id ?? null;
  const viewerEntry = viewerUserId
    ? (data.entries.find((entry) => entry.userId === viewerUserId) ?? null)
    : null;

  const challengerSlug =
    me?.publicSlug && me.profile.publicEnabled ? me.publicSlug : null;
  const publicEnabled = Boolean(challengerSlug);

  const quickMatch = pickQuickMatch(data.entries, viewerEntry);
  const suggestions = suggestOpponents(data.entries, viewerEntry, 9);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <ArenaHero
        viewerEntry={viewerEntry}
        totalPlayers={data.totalPlayers}
        challengerSlug={challengerSlug}
        publicEnabled={publicEnabled}
      />

      {publicEnabled && challengerSlug && (
        <>
          <ArenaQuickMatch
            opponent={quickMatch}
            challengerSlug={challengerSlug}
          />
          <ArenaOpponentGrid
            opponents={suggestions}
            challengerSlug={challengerSlug}
          />
        </>
      )}

      <ArenaRecentBouts />
    </div>
  );
}
