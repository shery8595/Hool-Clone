import Link from "next/link";
import { History } from "lucide-react";
import { ProfileSection } from "@/components/profile/profile-section";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import { formatKickoff } from "@/lib/mock/demo-user";
import { formatMatchTitle } from "@/lib/mock/matches";
import { cn } from "@/lib/utils";

type PublicPredictionHistoryProps = {
  items: PredictionHistoryItem[];
  fanName: string;
  limit?: number;
};

export function PublicPredictionHistory({
  items,
  fanName,
  limit = 5,
}: PublicPredictionHistoryProps) {
  if (items.length === 0) return null;

  const visible = items.slice(0, limit);
  const hiddenCount = items.length - visible.length;

  return (
    <ProfileSection
      eyebrow="Picks"
      title="Prediction history"
      description={`${fanName}'s locked picks and how the clone responded.`}
      action={
        hiddenCount > 0 ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            +{hiddenCount} more
          </span>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {visible.map(({ match, prediction, savedAt }) => (
          <Link
            key={prediction.matchId}
            href={`/predict/${prediction.matchId}`}
            className="group block rounded-xl border border-border/60 bg-gradient-to-br from-white to-hoolclone-green-50/20 p-4 transition hover:border-hoolclone-green-200 hover:shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-hoolclone-green-950 group-hover:text-hoolclone-green-800">
                  {formatMatchTitle(match)}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  {formatKickoff(match.kickoffAt)} · {match.stage}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Saved {new Date(savedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-hoolclone-green-100 px-2.5 py-1 font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200/60">
                  Fan: {prediction.winner} {prediction.homeScore}-
                  {prediction.awayScore}
                </span>
                {prediction.clone ? (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-semibold ring-1",
                      prediction.agreed
                        ? "bg-emerald-100 text-emerald-900 ring-emerald-200/60"
                        : "bg-amber-100 text-amber-900 ring-amber-200/60",
                    )}
                  >
                    Clone: {prediction.clone.winner}{" "}
                    {prediction.clone.homeScore}-{prediction.clone.awayScore}
                    {prediction.agreed ? " · agreed" : " · split"}
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    Clone pending
                  </span>
                )}
              </div>
            </div>
            {prediction.reasoning && (
              <p className="mt-3 border-l-2 border-hoolclone-green-600/30 pl-3 text-sm italic leading-relaxed text-muted-foreground">
                &ldquo;{prediction.reasoning}&rdquo;
              </p>
            )}
          </Link>
        ))}
      </div>
    </ProfileSection>
  );
}
