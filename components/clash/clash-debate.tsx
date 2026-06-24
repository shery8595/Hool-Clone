"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Swords, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClashMatchPicker } from "@/components/clash/clash-match-picker";
import { ClashMessage } from "@/components/clash/clash-message";
import { ClashParticipantCard } from "@/components/clash/clash-participant-card";
import { ClashTypingIndicator } from "@/components/clash/clash-typing-indicator";
import { WalrusBlobExplorerSheet } from "@/components/memory/walrus-blob-explorer-sheet";
import { fetchMatches, generateClashDebate } from "@/lib/api/client";
import type { ClashDebateResult } from "@/lib/clash/types";
import type { ClashParticipantMeta } from "@/lib/clash/types";
import type { Match, MemoryReceipt } from "@/lib/mock/types";

const BETWEEN_TURN_PAUSE_MS = 650;

type ClashDebateProps = {
  slugA: string;
  slugB: string;
  participantA: ClashParticipantMeta;
  participantB: ClashParticipantMeta;
  fromArena?: boolean;
};

export function ClashDebate({
  slugA,
  slugB,
  participantA,
  participantB,
  fromArena = false,
}: ClashDebateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMatch = searchParams.get("match");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    initialMatch,
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [result, setResult] = useState<ClashDebateResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleTurns, setVisibleTurns] = useState(0);
  const [isTypingTurn, setIsTypingTurn] = useState(false);
  const [pendingSpeaker, setPendingSpeaker] = useState<"A" | "B" | null>(null);
  const [exploreReceipt, setExploreReceipt] = useState<MemoryReceipt | null>(
    null,
  );

  const debateActive = generating || result !== null;
  const displayMatch = result?.match ?? selectedMatch;
  const debateComplete =
    Boolean(result) &&
    visibleTurns >= (result?.turns.length ?? 0) &&
    !isTypingTurn &&
    !pendingSpeaker &&
    !generating;

  useEffect(() => {
    if (!selectedMatchId || selectedMatch) return;
    void fetchMatches()
      .then((matches) => {
        const match = matches.find((item) => item.id === selectedMatchId);
        if (match?.homeTeam && match?.awayTeam) {
          setSelectedMatch(match);
        }
      })
      .catch(() => undefined);
  }, [selectedMatchId, selectedMatch]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [visibleTurns, pendingSpeaker, generating, debateComplete]);

  const resetTranscript = useCallback(() => {
    setResult(null);
    setVisibleTurns(0);
    setIsTypingTurn(false);
    setPendingSpeaker(null);
  }, []);

  const handleMatchSelect = useCallback(
    (matchId: string, match: Match) => {
      setSelectedMatchId(matchId);
      setSelectedMatch(match);
      resetTranscript();
      const params = new URLSearchParams(searchParams.toString());
      params.set("opponent", slugB);
      params.set("match", matchId);
      router.replace(`/u/${slugA}/clash?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams, slugA, slugB, resetTranscript],
  );

  const handleGenerate = async () => {
    if (!selectedMatchId) return;
    setGenerating(true);
    setError(null);
    resetTranscript();

    try {
      const data = await generateClashDebate({
        slugA,
        slugB,
        matchId: selectedMatchId,
      });
      setResult(data);
      setSelectedMatch(data.match);
      setVisibleTurns(1);
      setIsTypingTurn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate clash");
    } finally {
      setGenerating(false);
    }
  };

  const handleTypingComplete = useCallback(() => {
    if (!result) return;

    setIsTypingTurn(false);

    if (visibleTurns >= result.turns.length) {
      return;
    }

    const nextSpeaker = result.turns[visibleTurns]?.speaker ?? null;
    if (!nextSpeaker) return;

    setPendingSpeaker(nextSpeaker);
    window.setTimeout(() => {
      setVisibleTurns((count) => Math.min(count + 1, result.turns.length));
      setPendingSpeaker(null);
      setIsTypingTurn(true);
    }, BETWEEN_TURN_PAUSE_MS);
  }, [result, visibleTurns]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-to-br from-hoolclone-green-50 via-white to-amber-50 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Swords className="h-6 w-6 text-hoolclone-green-800" />
          <div>
            <h2 className="text-lg font-bold">
              {fromArena ? "Arena bout" : "Clone Clash"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {fromArena
                ? "Leaderboard rivals — two Walrus namespaces, one fixture."
                : "Two Walrus namespaces, one fixture — clones debate with their own memory receipts."}
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
            debateStarted={debateActive}
            memoriesCount={participantA.memoriesCount}
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
            debateStarted={debateActive}
            memoriesCount={participantB.memoriesCount}
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
              Summoning clones…
            </>
          ) : (
            "Start clash debate"
          )}
        </Button>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </section>

      {debateActive && (
        <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="border-b pb-3">
            <h3 className="font-bold">
              {displayMatch?.homeTeam?.name && displayMatch?.awayTeam?.name
                ? `${displayMatch.homeTeam.name} vs ${displayMatch.awayTeam.name}`
                : "Arena debate"}
            </h3>
            {displayMatch && (
              <p className="text-xs text-muted-foreground">
                {displayMatch.stage} · {displayMatch.venue}
              </p>
            )}
            {generating && (
              <p className="mt-2 text-xs font-medium text-hoolclone-green-800">
                Recalling Walrus memories from both namespaces…
              </p>
            )}
            {debateComplete && result?.verdict && (
              <div className="mt-3 rounded-xl border border-hoolclone-green-200 bg-hoolclone-green-50/60 px-4 py-3 animate-in fade-in duration-500">
                <p className="text-sm font-semibold text-hoolclone-green-950">
                  Arena verdict · {result.verdict.scoreA}–
                  {result.verdict.scoreB}
                  {result.verdict.winnerSlug
                    ? ` · @${result.verdict.winnerSlug} wins`
                    : " · Draw"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.verdict.summary}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {generating && !result && (
              <ClashTypingIndicator
                displayName={participantA.displayName}
                side="A"
                label="recalling memories"
              />
            )}

            {result?.turns.slice(0, visibleTurns).map((turn, index) => {
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
                  animate={isLast && isTypingTurn}
                  onTypingComplete={
                    isLast && isTypingTurn ? handleTypingComplete : undefined
                  }
                  onExploreReceipt={setExploreReceipt}
                />
              );
            })}

            {pendingSpeaker && (
              <ClashTypingIndicator
                displayName={
                  pendingSpeaker === "A"
                    ? participantA.displayName
                    : participantB.displayName
                }
                side={pendingSpeaker}
              />
            )}
          </div>

          <div ref={transcriptEndRef} aria-hidden />
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
