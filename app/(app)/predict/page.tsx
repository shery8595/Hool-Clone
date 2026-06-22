"use client";

import { useMemo } from "react";
import { Target } from "lucide-react";
import { MatchBrowseGrid, MatchSummaryStats, partitionMatches } from "@/components/match/match-schedule-sections";
import { MatchListCard } from "@/components/match/match-card";
import { PredictionHistory } from "@/components/match/prediction-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cacheKeys, peekCached } from "@/lib/api/data-cache";
import {
  fetchMatchesRaw,
  fetchPredictionHistoryRaw,
} from "@/lib/api/client";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import { useIntervalRefresh } from "@/lib/hooks/use-interval-refresh";
import { resolveMatches } from "@/lib/match-data/match-status";
import type { Match } from "@/lib/mock/types";
import { matches as mockMatches } from "@/lib/mock/matches";
import { useUser } from "@/components/providers/user-provider";

const MATCH_POLL_MS = 60_000;
const USE_MOCK_SCHEDULE_FALLBACK = process.env.NODE_ENV === "development";

function scheduleFallback(): Match[] {
  return USE_MOCK_SCHEDULE_FALLBACK ? mockMatches : [];
}

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
    peekCached<Match[]>(cacheKeys.matches()) ?? scheduleFallback();

  const { data: rawMatches = initialMatches, hydrating: matchesHydrating, refresh: refreshMatches } =
    useCachedData(cacheKeys.matches(), fetchMatchesRaw, initialMatches);

  const matches = useMemo(() => resolveMatches(rawMatches), [rawMatches]);

  const { data: history = [], hydrating: historyHydrating } = useCachedData(
    me?.id ? cacheKeys.predictionHistory(me.id) : null,
    fetchPredictionHistoryRaw,
    [],
  );

  const { upcoming, finished, live } = useMemo(
    () => partitionMatches(matches),
    [matches],
  );

  const needsMatchPoll = useMemo(
    () => live.length > 0 || matches.some((m) => m.status === "live"),
    [live.length, matches],
  );

  useIntervalRefresh(refreshMatches, MATCH_POLL_MS, needsMatchPoll);

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

  const groupMatchesFor = (g: string) =>
    matches.filter((m) => m.group === g);

  const predictedMatchIds = useMemo(
    () => new Set(history.map((item) => item.prediction.matchId)),
    [history],
  );

  const showMockLayout =
    matchesHydrating && USE_MOCK_SCHEDULE_FALLBACK && initialMatches === mockMatches;
  const syncing = matchesHydrating || historyHydrating;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
        <MatchSummaryStats matches={matches} />
      </div>

      <PredictionHistory items={history} />

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4 grid h-auto w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcoming.length > 0 && (
              <span className="ml-1 rounded-full bg-hoolclone-green-100 px-1.5 text-[10px] font-bold tabular-nums">
                {upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="results">
            Results
            {finished.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-bold tabular-nums">
                {finished.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0 space-y-6">
          {upcoming.length === 0 && live.length === 0 ? (
            <p className="rounded-2xl border border-dashed bg-white px-6 py-12 text-center text-sm text-muted-foreground">
              No upcoming fixtures — check Results for completed matches.
            </p>
          ) : (
            <>
              {live.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-hoolclone-yellow-800">
                    Live now
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {live.map((match) => (
                      <MatchListCard
                        key={match.id}
                        match={match}
                        predicted={predictedMatchIds.has(match.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {upcoming.length > 0 && (
                <>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Next up
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {upcoming.slice(0, 3).map((match) => (
                        <MatchListCard
                          key={match.id}
                          match={match}
                          predicted={predictedMatchIds.has(match.id)}
                        />
                      ))}
                    </div>
                  </div>
                  {upcoming.length > 3 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Later
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {upcoming.slice(3).map((match) => (
                          <MatchListCard
                            key={match.id}
                            match={match}
                            predicted={predictedMatchIds.has(match.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          {finished.length === 0 ? (
            <p className="rounded-2xl border border-dashed bg-white px-6 py-12 text-center text-sm text-muted-foreground">
              No completed matches yet. Final scores appear here after full time.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {finished.map((match) => (
                <MatchListCard
                  key={match.id}
                  match={match}
                  predicted={predictedMatchIds.has(match.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-0 space-y-4">
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
                <MatchBrowseGrid
                  matches={groupMatchesFor(g)}
                  predictedMatchIds={predictedMatchIds}
                />
              </TabsContent>
            ))}

            <TabsContent value="r32" className="mt-4">
              <MatchBrowseGrid
                matches={knockoutByStage.r32}
                predictedMatchIds={predictedMatchIds}
              />
            </TabsContent>
            <TabsContent value="r16" className="mt-4">
              <MatchBrowseGrid
                matches={knockoutByStage.r16}
                predictedMatchIds={predictedMatchIds}
              />
            </TabsContent>
            <TabsContent value="qf" className="mt-4">
              <MatchBrowseGrid
                matches={knockoutByStage.qf}
                predictedMatchIds={predictedMatchIds}
              />
            </TabsContent>
            <TabsContent value="sf" className="mt-4">
              <MatchBrowseGrid
                matches={knockoutByStage.sf}
                predictedMatchIds={predictedMatchIds}
              />
            </TabsContent>
            <TabsContent value="final" className="mt-4">
              <MatchBrowseGrid
                matches={knockoutByStage.finals}
                predictedMatchIds={predictedMatchIds}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
