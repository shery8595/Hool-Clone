"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { PredictButton } from "@/components/predict/predict-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClonePrediction, Match, MemoryReceipt, Prediction } from "@/lib/mock/types";
import { isUuid } from "@/lib/utils";

function pickDisputedMemoryId(receipts: MemoryReceipt[]): string | undefined {
  const id = receipts[0]?.id;
  if (!id || id.startsWith("receipt-") || !isUuid(id)) return undefined;
  return id;
}

function extractCorrectionSnippet(text: string): string {
  const match = text.match(/Correction:\s*([^[\n]+)/i);
  if (match?.[1]) return match[1].trim();
  return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}

function findSavedCorrectionReceipt(
  receipts: MemoryReceipt[],
): MemoryReceipt | undefined {
  return receipts.find(
    (receipt) =>
      receipt.memorySource === "clone_correction" &&
      (receipt.text.includes("Correction:") ||
        receipt.provenanceLabel?.includes("correction")),
  ) ?? receipts.find((receipt) => receipt.memorySource === "clone_correction");
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
    correctionText?: string;
  }) => void;
};

export function CloneCorrectionPanel({
  match,
  prediction,
  clone,
  onCorrected,
}: CloneCorrectionPanelProps) {
  const savedReceipt = findSavedCorrectionReceipt(clone.receipts);
  const [correction, setCorrection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taught, setTaught] = useState(Boolean(savedReceipt));
  const [savedSummary, setSavedSummary] = useState(
    savedReceipt ? extractCorrectionSnippet(savedReceipt.text) : "",
  );
  const [stillDisagrees, setStillDisagrees] = useState(
    prediction.agreed === false,
  );

  useEffect(() => {
    const receipt = findSavedCorrectionReceipt(clone.receipts);
    setCorrection("");
    setSubmitting(false);
    setError(null);
    setTaught(Boolean(receipt));
    setSavedSummary(receipt ? extractCorrectionSnippet(receipt.text) : "");
    setStillDisagrees(prediction.agreed === false);
  }, [match.id, clone.receipts, prediction.agreed]);

  const wrongMemoryId = pickDisputedMemoryId(clone.receipts);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { submitCloneCorrection } = await import("@/lib/api/client");
      const result = await submitCloneCorrection(match.id, {
        correction,
        wrongMemoryId,
        regenerate: true,
      });
      const summary = correction.trim();
      setCorrection("");
      setSavedSummary(summary);
      setTaught(true);
      setStillDisagrees(result.agreed === false);
      if (result.prediction) {
        onCorrected({
          prediction: result.prediction,
          agreed: result.agreed,
          correctionText: summary,
        });
      } else {
        onCorrected({ agreed: result.agreed, correctionText: summary });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to store correction");
    } finally {
      setSubmitting(false);
    }
  };

  if (taught) {
    return (
      <Card className="rounded-2xl border border-hoolclone-green-200 bg-hoolclone-green-50/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-hoolclone-green-700" />
            Successfully taught
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-hoolclone-gray-900">
            Your correction was saved to Walrus and the clone was retrained for
            this match.
          </p>
          {savedSummary && (
            <blockquote className="rounded-xl border border-hoolclone-green-100 bg-white px-4 py-3 text-sm italic text-muted-foreground">
              &ldquo;{savedSummary}&rdquo;
            </blockquote>
          )}
          {stillDisagrees ? (
            <p className="text-sm text-muted-foreground">
              Your clone still disagrees on the scoreline — check the updated
              prediction and cited memories on the right.
            </p>
          ) : (
            <p className="text-sm font-medium text-hoolclone-green-800">
              Your clone now agrees with your pick.
            </p>
          )}
          <div className="flex justify-center">
            <PredictButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setTaught(false);
                setError(null);
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Teach another correction
            </PredictButton>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              className="inline-block cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold leading-5 text-muted-foreground outline-none transition-[box-shadow,transform] duration-200 hover:shadow-sm active:scale-[0.98] hover:border-hoolclone-green-700 hover:text-hoolclone-green-900"
            >
              {snippet}
            </button>
          ))}
        </div>

        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="e.g. France have the best attack — I trust a bigger win here..."
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-hoolclone-green-700/30 focus:ring-2"
        />

        <div className="flex justify-center">
          <PredictButton
            type="button"
            size="lg"
            disabled={submitting || correction.trim().length < 8}
            onClick={() => void submit()}
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retraining clone...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Store correction &amp; retrain clone
              </>
            )}
          </PredictButton>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
