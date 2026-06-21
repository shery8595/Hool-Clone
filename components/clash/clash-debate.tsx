"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Swords, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClashMatchPicker } from "@/components/clash/clash-match-picker";
import { ClashMessage } from "@/components/clash/clash-message";
import { ClashParticipantCard } from "@/components/clash/clash-participant-card";
import { WalrusBlobExplorerSheet } from "@/components/memory/walrus-blob-explorer-sheet";
import { generateClashDebate } from "@/lib/api/client";
import type { ClashDebateResult } from "@/lib/clash/types";
import type { ClashParticipantMeta } from "@/lib/clash/types";
import type { MemoryReceipt } from "@/lib/mock/types";

type ClashDebateProps = {
  slugA: string;
  slugB: string;
  participantA: ClashParticipantMeta;
  participantB: ClashParticipantMeta;
};

export function ClashDebate({
  slugA,
  slugB,
  participantA,
  participantB,
}: ClashDebateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMatch = searchParams.get("match");

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    initialMatch,
  );
  const [result, setResult] = useState<ClashDebateResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleTurns, setVisibleTurns] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [exploreReceipt, setExploreReceipt] = useState<MemoryReceipt | null>(
    null,
  );

  const handleMatchSelect = useCallback(
    (matchId: string) => {
      setSelectedMatchId(matchId);
      setResult(null);
      setVisibleTurns(0);
      setTypingDone(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set("opponent", slugB);
      params.set("match", matchId);
      router.replace(`/u/${slugA}/clash?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams, slugA, slugB],
  );

  const handleGenerate = async () => {
    if (!selectedMatchId) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setVisibleTurns(0);
    setTypingDone(false);

    try {
      const data = await generateClashDebate({
        slugA,
        slugB,
        matchId: selectedMatchId,
      });
      setResult(data);
      setVisibleTurns(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate clash");
    } finally {
      setGenerating(false);
    }
  };

  const handleTypingComplete = () => {
    setTypingDone(true);
  };

  const advanceTurn = useCallback(() => {
    if (!result) return;
    setTypingDone(false);
    setVisibleTurns((n) => Math.min(n + 1, result.turns.length));
  }, [result]);

  useEffect(() => {
    if (!typingDone || !result) return;
    if (visibleTurns >= result.turns.length) return;
    const timer = setTimeout(advanceTurn, 400);
    return () => clearTimeout(timer);
  }, [typingDone, result, visibleTurns, advanceTurn]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-to-br from-hoolclone-green-50 via-white to-amber-50 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Swords className="h-6 w-6 text-hoolclone-green-800" />
          <div>
            <h2 className="text-lg font-bold">Clone Clash</h2>
            <p className="text-sm text-muted-foreground">
              Two Walrus namespaces, one fixture — clones debate with their own
              memory receipts.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ClashParticipantCard
            participant={{
              slug: participantA.slug,
              displayName: participantA.displayName,
              handle: participantA.handle,
              maturityLabel: participantA.maturityLabel,
              namespace: participantA.namespace,
              receipts: result?.participantA.receipts ?? [],
            }}
            side="A"
            onExploreReceipt={setExploreReceipt}
          />
          <ClashParticipantCard
            participant={{
              slug: participantB.slug,
              displayName: participantB.displayName,
              handle: participantB.handle,
              maturityLabel: participantB.maturityLabel,
              namespace: participantB.namespace,
              receipts: result?.participantB.receipts ?? [],
            }}
            side="B"
            onExploreReceipt={setExploreReceipt}
          />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <ClashMatchPicker
          selectedMatchId={selectedMatchId}
          onSelect={handleMatchSelect}
        />

        <Button
          className="mt-4"
          disabled={!selectedMatchId || generating}
          onClick={() => void handleGenerate()}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recalling from both namespaces…
            </>
          ) : (
            "Generate clash debate"
          )}
        </Button>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </section>

      {result && (
        <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="border-b pb-3">
            <h3 className="font-bold">
              {result.match.homeTeam?.name} vs {result.match.awayTeam?.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {result.match.stage} · {result.match.venue}
            </p>
          </div>

          <div className="space-y-6">
            {result.turns.slice(0, visibleTurns).map((turn, index) => {
              const isLast = index === visibleTurns - 1;
              const name =
                turn.speaker === "A"
                  ? result.participantA.displayName
                  : result.participantB.displayName;

              return (
                <ClashMessage
                  key={`${turn.speaker}-${index}`}
                  turn={turn}
                  displayName={name}
                  animate={isLast && !typingDone}
                  onTypingComplete={
                    isLast ? handleTypingComplete : undefined
                  }
                  onExploreReceipt={setExploreReceipt}
                />
              );
            })}
          </div>
        </section>
      )}

      <WalrusBlobExplorerSheet
        receipt={exploreReceipt}
        open={Boolean(exploreReceipt)}
        onOpenChange={(open) => {
          if (!open) setExploreReceipt(null);
        }}
      />
    </div>
  );
}
