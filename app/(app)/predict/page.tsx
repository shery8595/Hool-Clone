"use client";

import { useMemo } from "react";
import { Target } from "lucide-react";
import { MatchListCard } from "@/components/match/match-card";
import { PredictionHistory } from "@/components/match/prediction-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cacheKeys, peekCached } from "@/lib/api/data-cache";
import {
  fetchMatchesRaw,
  fetchPredictionHistoryRaw,
} from "@/lib/api/client";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import type { Match } from "@/lib/mock/types";
import {
  getGroupMatches,
  matches as mockMatches,
} from "@/lib/mock/matches";
import { useUser } from "@/components/providers/user-provider";

const GROUPS = "ABCDEFGHIJKL".split("");

const KNOCKOUT_TABS = [
  { id: "r32", label: "Round of 32", stage: "Round of 32" },
  { id: "r16", label: "Round of 16", stage: "Round of 16" },
  { id: "qf", label: "Quarter-Finals", stage: "Quarter-Final" },
  { id: "sf", label: "Semi-Finals", stage: "Semi-Final" },
  { id: "final", label: "Finals", stage: "" },
] as const;

export default function PredictListPage() {
  const { me } = useUser();

  const initialMatches =
    peekCached<Match[]>(cacheKeys.matches()) ?? mockMatches;

  const { data: matches = initialMatches, hydrating: matchesHydrating } =
    useCachedData(cacheKeys.matches(), fetchMatchesRaw, initialMatches);

  const { data: history = [], hydrating: historyHydrating } = useCachedData(
    me?.id ? cacheKeys.predictionHistory(me.id) : null,
    fetchPredictionHistoryRaw,
    [],
  );

  const knockoutByStage = useMemo(() => {
    const r32 = matches.filter((m) => m.stage === "Round of 32");
    const r16 = matches.filter((m) => m.stage === "Round of 16");
    const qf = matches.filter((m) => m.stage === "Quarter-Final");
    const sf = matches.filter((m) => m.stage === "Semi-Final");
    const finals = matches.filter(
      (m) => m.stage === "Third Place" || m.stage === "Final",
    );
    return { r32, r16, qf, sf, finals };
  }, [matches]);

  const showMockLayout =
    matchesHydrating && initialMatches === mockMatches;

  const groupMatchesFor = (g: string) =>
    showMockLayout ? getGroupMatches(g) : matches.filter((m) => m.group === g);

  const syncing = matchesHydrating || historyHydrating;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6 text-hoolclone-green-700" />
        <div>
          <h1 className="text-2xl font-bold">Predict Match</h1>
          <p className="text-sm text-muted-foreground">
            Official FIFA World Cup 2026 schedule · {matches.length} matches ·
            48 nations
            {showMockLayout && " · showing schedule preview (syncing live data...)"}
            {syncing && !showMockLayout && " · Syncing..."}
          </p>
        </div>
      </div>

      <PredictionHistory items={history} />

      <Tabs defaultValue="group-A">
        <TabsList className="flex h-auto max-h-32 flex-wrap gap-1 overflow-y-auto">
          {GROUPS.map((g) => (
            <TabsTrigger key={g} value={`group-${g}`}>
              Group {g}
            </TabsTrigger>
          ))}
          {KNOCKOUT_TABS.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map((g) => (
          <TabsContent key={g} value={`group-${g}`} className="mt-4">
            <MatchGrid matches={groupMatchesFor(g)} />
          </TabsContent>
        ))}

        <TabsContent value="r32" className="mt-4">
          <MatchGrid matches={knockoutByStage.r32} />
        </TabsContent>
        <TabsContent value="r16" className="mt-4">
          <MatchGrid matches={knockoutByStage.r16} />
        </TabsContent>
        <TabsContent value="qf" className="mt-4">
          <MatchGrid matches={knockoutByStage.qf} />
        </TabsContent>
        <TabsContent value="sf" className="mt-4">
          <MatchGrid matches={knockoutByStage.sf} />
        </TabsContent>
        <TabsContent value="final" className="mt-4">
          <MatchGrid matches={knockoutByStage.finals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchGrid({ matches: list }: { matches: Match[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((match) => (
        <MatchListCard key={match.id} match={match} />
      ))}
    </div>
  );
}
