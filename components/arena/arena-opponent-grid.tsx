import { ArenaOpponentCard } from "@/components/arena/arena-opponent-card";
import type { ArenaOpponent } from "@/lib/clash/arena-opponents";

type ArenaOpponentGridProps = {
  opponents: ArenaOpponent[];
  challengerSlug: string;
  title?: string;
  description?: string;
};

export function ArenaOpponentGrid({
  opponents,
  challengerSlug,
  title = "Suggested rivals",
  description = "Clones from the global leaderboard — pick your opponent.",
}: ArenaOpponentGridProps) {
  if (opponents.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-8 text-center">
        <p className="text-sm font-semibold text-hoolclone-green-950">
          No rivals to suggest yet
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back once more fans enable public profiles.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-hoolclone-green-950">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {opponents.map((opponent) => (
          <ArenaOpponentCard
            key={opponent.userId}
            opponent={opponent}
            challengerSlug={challengerSlug}
          />
        ))}
      </div>
    </section>
  );
}
