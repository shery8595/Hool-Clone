"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { JUDGE_DEMO_CORRECTION_TEXT } from "@/lib/judge-demo/constants";
import {
  JUDGE_DEMO_CORRECTION_MAX_LENGTH,
  JUDGE_DEMO_CORRECTION_MIN_LENGTH,
} from "@/lib/judge-demo/parse-correction-text";
import type { ClonePrediction, Prediction } from "@/lib/mock/types";
import { TextWithTeamFlags } from "@/components/match/team-label-with-flags";

type JudgeState = {
  matchId: string;
  matchLabel: string;
  human: Prediction | null;
  clone: ClonePrediction | null;
};

type CorrectionResult = {
  memoryId: string;
  storageStatus: string;
  walrusBlobId?: string;
  walrusNamespace?: string;
  correctionText: string;
};

export function JudgeLiveProofSandbox() {
  const [state, setState] = useState<JudgeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [correcting, setCorrecting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [correction, setCorrection] = useState<CorrectionResult | null>(null);
  const [regeneratedClone, setRegeneratedClone] = useState<ClonePrediction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState(
    JUDGE_DEMO_CORRECTION_TEXT,
  );

  const trimmedCorrection = correctionText.trim();
  const correctionTooShort =
    trimmedCorrection.length < JUDGE_DEMO_CORRECTION_MIN_LENGTH;
  const correctionTooLong =
    trimmedCorrection.length > JUDGE_DEMO_CORRECTION_MAX_LENGTH;

  const loadState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/judge-demo/state");
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to load demo state");
      }
      setState(body as JudgeState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const applyCorrection = async () => {
    if (correctionTooShort || correctionTooLong) return;

    setCorrecting(true);
    setError(null);
    try {
      const res = await fetch("/api/judge-demo/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctionText: trimmedCorrection }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Correction failed");
      }
      setCorrection(body as CorrectionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Correction failed");
    } finally {
      setCorrecting(false);
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/judge-demo/regenerate", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Regenerate failed");
      }
      setRegeneratedClone(body.clone ?? null);
      setState((prev) =>
        prev
          ? {
              ...prev,
              clone: body.clone ?? prev.clone,
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regenerate failed");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card className="rounded-2xl border-2 border-hoolclone-yellow-300/80 bg-gradient-to-br from-hoolclone-yellow-50/40 via-white to-hoolclone-green-50/30 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-5 w-5 text-hoolclone-green-700" />
          <CardTitle className="text-base text-hoolclone-green-950">
            Live judge sandbox
          </CardTitle>
          <span className="rounded-full bg-hoolclone-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-900">
            Writes real Walrus correction
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          No wallet required. Type any fan take below, write it to Walrus for the
          demo clone on{" "}
          <strong>{state?.matchLabel ?? "Colombia vs Portugal"}</strong>, then
          regenerate the clone prediction with cited receipts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading demo clone state…
          </div>
        ) : state?.clone ? (
          <div className="rounded-xl border border-border/60 bg-white/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Current clone take (before live correction)
            </p>
            <p className="mt-2 text-lg font-bold text-hoolclone-green-900">
              <TextWithTeamFlags
                text={`${state.clone.homeScore}-${state.clone.awayScore} ${state.clone.winner}`}
                size="sm"
              />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {state.clone.reasoning}
            </p>
          </div>
        ) : null}

        <div className="space-y-2 rounded-xl border border-dashed border-hoolclone-green-200 bg-hoolclone-green-50/40 p-4">
          <label
            htmlFor="judge-demo-correction"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Your correction (saved to Walrus)
          </label>
          <Textarea
            id="judge-demo-correction"
            value={correctionText}
            onChange={(event) => setCorrectionText(event.target.value)}
            placeholder="e.g. I trust Portugal in tight games — loyalty matters more than xG."
            rows={3}
            disabled={correcting || regenerating}
            className="border-hoolclone-green-200 bg-white text-sm text-hoolclone-green-950"
            maxLength={JUDGE_DEMO_CORRECTION_MAX_LENGTH}
          />
          <p className="text-xs text-muted-foreground">
            {trimmedCorrection.length}/{JUDGE_DEMO_CORRECTION_MAX_LENGTH} · min{" "}
            {JUDGE_DEMO_CORRECTION_MIN_LENGTH} characters
          </p>
          {correctionTooShort && trimmedCorrection.length > 0 && (
            <p className="text-xs text-amber-800">
              Add a bit more detail so the clone has something to recall.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void applyCorrection()}
            disabled={
              correcting || regenerating || correctionTooShort || correctionTooLong
            }
          >
            {correcting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {correcting ? "Writing to Walrus…" : "Apply correction"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void regenerate()}
            disabled={regenerating || correcting || !correction}
          >
            {regenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regenerate clone prediction
          </Button>
        </div>

        {correction && (
          <div className="space-y-2 rounded-xl border border-hoolclone-green-200 bg-hoolclone-green-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-hoolclone-green-800">
              Walrus write confirmed
            </p>
            <p className="text-sm text-hoolclone-green-950">
              Saved take: &ldquo;{correction.correctionText}&rdquo;
            </p>
            <p className="text-sm text-hoolclone-green-950">
              Memory ID:{" "}
              <span className="font-mono text-xs">{correction.memoryId}</span>
            </p>
            {correction.walrusBlobId ? (
              <p className="font-mono text-xs text-hoolclone-green-900">
                Blob: {correction.walrusBlobId}
              </p>
            ) : (
              <p className="text-xs text-amber-800">
                Blob pending — storage status: {correction.storageStatus}
              </p>
            )}
            {correction.walrusNamespace && (
              <p className="font-mono text-[10px] text-muted-foreground">
                Namespace: {correction.walrusNamespace}
              </p>
            )}
          </div>
        )}

        {regeneratedClone && correction && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Regenerated clone (after correction recall)
            </p>
            <p className="text-lg font-bold text-hoolclone-green-900">
              <TextWithTeamFlags
                text={`${regeneratedClone.homeScore}-${regeneratedClone.awayScore} ${regeneratedClone.winner}`}
                size="sm"
              />
            </p>
            <p className="text-sm text-muted-foreground">
              {regeneratedClone.reasoning}
            </p>
            {regeneratedClone.receipts.length > 0 && (
              <div className="space-y-2">
                {regeneratedClone.receipts.map((receipt) => (
                  <MemoryReceiptCard key={receipt.id} receipt={receipt} compact />
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
