"use client";

import { useEffect, useState } from "react";
import { fetchMatches } from "@/lib/api/client";
import type { Match } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type ClashMatchPickerProps = {
  selectedMatchId: string | null;
  onSelect: (matchId: string, match: Match) => void;
  className?: string;
};

export function ClashMatchPicker({
  selectedMatchId,
  onSelect,
  className,
}: ClashMatchPickerProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const withTeams = (await fetchMatches()).filter(
          (m) => m.homeTeam && m.awayTeam,
        );
        setMatches(withTeams);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Loading fixtures…
      </p>
    );
  }

  if (error) {
    return <p className={cn("text-sm text-destructive", className)}>{error}</p>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor="clash-match-picker"
        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >
        Pick a fixture
      </label>
      <select
        id="clash-match-picker"
        value={selectedMatchId ?? ""}
        onChange={(e) => {
          const match = matches.find((item) => item.id === e.target.value);
          if (match) onSelect(match.id, match);
        }}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium shadow-sm focus:border-hoolclone-green-500 focus:outline-none focus:ring-2 focus:ring-hoolclone-green-200"
      >
        <option value="" disabled>
          Select a match…
        </option>
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            {match.homeTeam!.name} vs {match.awayTeam!.name} — {match.stage}
            {match.group ? ` (${match.group})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
