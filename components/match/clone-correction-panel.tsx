"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClonePrediction, Match, MemoryReceipt, Prediction } from "@/lib/mock/types";
import { isUuid } from "@/lib/utils";

function pickDisputedMemoryId(receipts: MemoryReceipt[]): string | undefined {
  const id = receipts[0]?.id;
  if (!id || id.startsWith("receipt-") || !isUuid(id)) return undefined;
  return id;
}

const quickCorrections = [
  "My pick is right — clone leaned on an old bias.",
  "I changed my mind for this match because of form.",
  "Clone should weight loyalty less here.",
];

type CloneCorrectionPanelProps = {
  match: Match;
  prediction: Prediction;
  clone: ClonePrediction;
  onCorrected: (result: {
    prediction?: Prediction;
    agreed?: boolean;
  }) => void;
};

export function CloneCorrectionPanel({
  match,
  prediction,
  clone,
  onCorrected,
}: CloneCorrectionPanelProps) {
  const [correction, setCorrection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const wrongMemoryId = pickDisputedMemoryId(clone.receipts);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const { submitCloneCorrection } = await import("@/lib/api/client");
      const result = await submitCloneCorrection(match.id, {
        correction,
        wrongMemoryId,
        regenerate: true,
      });
      setCorrection("");
      setSuccess(
        result.agreed
          ? "Correction stored — your clone now agrees with you."
          : "Correction stored — clone retrained with your feedback.",
      );
      if (result.prediction) {
        onCorrected({ prediction: result.prediction, agreed: result.agreed });
      } else {
        onCorrected({ agreed: result.agreed });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to store correction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl border-hoolclone-yellow-500/40 bg-hoolclone-yellow-500/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-hoolclone-green-700" />
          Teach your clone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your clone picked{" "}
          <strong>
            {clone.winner} {clone.homeScore}-{clone.awayScore}
          </strong>
          , but you chose{" "}
          <strong>
            {prediction.winner} {prediction.homeScore}-{prediction.awayScore}
          </strong>
          . Explain your real instinct — we&apos;ll store it as a correction memory
          and regenerate the clone.
        </p>

        <div className="flex flex-wrap gap-2">
          {quickCorrections.map((snippet) => (
            <button
              key={snippet}
              type="button"
              onClick={() => setCorrection(snippet)}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground hover:border-hoolclone-green-700 hover:text-hoolclone-green-900"
            >
              {snippet}
            </button>
          ))}
        </div>

        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="e.g. I back underdogs in knockouts even when my rival team is playing..."
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-hoolclone-green-700/30 focus:ring-2"
        />

        <Button
          type="button"
          className="w-full"
          disabled={submitting || correction.trim().length < 8}
          onClick={() => void submit()}
        >
          {submitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retraining clone...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Store correction &amp; retrain clone
            </>
          )}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm font-medium text-hoolclone-green-800">{success}</p>
        )}
      </CardContent>
    </Card>
  );
}
