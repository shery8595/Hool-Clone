import type { Match } from "@/lib/mock/types";
import { formatDateTime } from "@/lib/mock/demo-user";
import { formatMatchTitle, formatVenueLine } from "@/lib/mock/matches";
import {
  formatFinalScore,
  isMatchFinished,
  isMatchLive,
  winnerTeamName,
} from "@/lib/match-data/match-status";
import { cn } from "@/lib/utils";
import { MatchTeamsDisplay } from "./match-card";

type MatchBannerProps = {
  match: Match;
};

export function MatchBanner({ match }: MatchBannerProps) {
  const finished = isMatchFinished(match);
  const live = isMatchLive(match);
  const scoreLine = formatFinalScore(match);
  const winner = winnerTeamName(match);

  return (
    <div
      className={cn(
        "stadium-bg relative overflow-hidden rounded-2xl px-6 py-10 text-white",
        finished && "opacity-95",
      )}
    >
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
            {match.stage}
          </p>
          {finished && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
              Full time
            </span>
          )}
          {live && (
            <span className="rounded-full bg-hoolclone-yellow-400/90 px-2 py-0.5 text-[10px] font-bold uppercase text-hoolclone-green-950">
              Live
            </span>
          )}
        </div>
        <p className="text-xs opacity-80">
          Match {match.matchNumber} · {formatVenueLine(match)}
        </p>
        {finished && scoreLine ? (
          <div className="text-center">
            <p className="text-4xl font-bold tabular-nums sm:text-5xl">{scoreLine}</p>
            {winner && (
              <p className="mt-2 text-sm font-semibold opacity-90">{winner} win</p>
            )}
          </div>
        ) : (
          <MatchTeamsDisplay match={match} size="xl" />
        )}
        <p className="text-lg font-bold sm:text-xl">{formatMatchTitle(match)}</p>
        <p className="text-sm opacity-90">{formatDateTime(match.kickoffAt)}</p>
      </div>
    </div>
  );
}
