import type { Match } from "@/lib/mock/types";
import { formatDateTime } from "@/lib/mock/demo-user";
import { formatMatchTitle, formatVenueLine } from "@/lib/mock/matches";
import { MatchTeamsDisplay } from "./match-card";

type MatchBannerProps = {
  match: Match;
};

export function MatchBanner({ match }: MatchBannerProps) {
  return (
    <div className="stadium-bg relative overflow-hidden rounded-2xl px-6 py-10 text-white">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
          {match.stage}
        </p>
        <p className="text-xs opacity-80">
          Match {match.matchNumber} · {formatVenueLine(match)}
        </p>
        <MatchTeamsDisplay match={match} size="xl" />
        <p className="text-lg font-bold sm:text-xl">{formatMatchTitle(match)}</p>
        <p className="text-sm opacity-90">{formatDateTime(match.kickoffAt)}</p>
      </div>
    </div>
  );
}
