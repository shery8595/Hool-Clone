import { Bot, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { WalrusMemoryBadge } from "@/components/layout/walrus-memory-badge";
import type { CloneMaturity, ClonePrediction, Match } from "@/lib/mock/types";
import { TeamFlag } from "./team-flag";

type ClonePredictionPanelProps = {
  match: Match;
  clone: ClonePrediction;
  maturity?: CloneMaturity;
};

export function ClonePredictionPanel({
  match,
  clone,
  maturity = "Learner",
}: ClonePredictionPanelProps) {
  if (!match.homeTeam || !match.awayTeam) return null;

  const confidenceLabel =
    clone.confidence >= 70
      ? "High confidence"
      : clone.confidence >= 45
        ? "Medium confidence"
        : "Low confidence";

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-hoolclone-green-700" />
          Your Clone&apos;s Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-hoolclone-gray-50 p-3">
          <CloneAvatar size="sm" />
          <div>
            <p className="font-semibold">Your HoolClone</p>
            <p className="text-xs text-muted-foreground">
              {confidenceLabel}
              {clone.receipts.length > 0 &&
                ` · ${clone.receipts.length} memories cited`}
            </p>
          </div>
          <MaturityBadge maturity={maturity} className="ml-auto hidden sm:inline-flex" />
        </div>

        <div className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold">
            <TeamFlag team={match.homeTeam} size="md" />
            <span>
              {match.homeTeam.name} {clone.homeScore} - {clone.awayScore}{" "}
              {match.awayTeam.name}
            </span>
            <TeamFlag team={match.awayTeam} size="md" />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">
            REASONING
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {clone.reasoning}
          </p>
        </div>

        {clone.receipts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">
              MEMORIES CITED IN THIS PREDICTION
            </p>
            {clone.receipts.map((receipt) => (
              <MemoryReceiptCard key={receipt.id} receipt={receipt} compact />
            ))}
          </div>
        )}

        {clone.insight && (
          <div className="flex items-start gap-3 rounded-xl bg-hoolclone-yellow-500 px-4 py-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-hoolclone-gray-900" />
            <p className="text-sm font-semibold text-hoolclone-gray-900">
              {clone.insight}
            </p>
          </div>
        )}

        <WalrusMemoryBadge
          variant="inline"
          memoriesUsed={clone.receipts.length}
        />
      </CardContent>
    </Card>
  );
}
