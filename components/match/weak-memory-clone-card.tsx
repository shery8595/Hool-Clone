import { Brain, Bot, CheckCircle2, RefreshCw } from "lucide-react";
import { PredictButton, PredictButtonLink } from "@/components/predict/predict-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloneAvatar } from "@/components/clone/clone-avatar";

type WeakMemoryCloneCardProps = {
  trainingQuestion: string;
  reasoning?: string;
  variant?: "needs-training" | "trained";
  memoriesCount?: number;
  onRegenerate?: () => void;
  regenerating?: boolean;
};

export function WeakMemoryCloneCard({
  trainingQuestion,
  reasoning,
  variant = "needs-training",
  memoriesCount,
  onRegenerate,
  regenerating = false,
}: WeakMemoryCloneCardProps) {
  const trained = variant === "trained";

  return (
    <Card
      className={
        trained
          ? "rounded-2xl border border-hoolclone-green-200 bg-hoolclone-green-50/40 shadow-sm"
          : "rounded-2xl border-0 shadow-sm"
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {trained ? (
            <CheckCircle2 className="h-5 w-5 text-hoolclone-green-700" />
          ) : (
            <Bot className="h-5 w-5 text-hoolclone-green-700" />
          )}
          {trained ? "Successfully taught" : "Your Clone Needs Training"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={
            trained
              ? "flex items-start gap-3 rounded-xl bg-white/80 p-4"
              : "flex items-start gap-3 rounded-xl bg-hoolclone-yellow-500/20 p-4"
          }
        >
          <CloneAvatar size="sm" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-hoolclone-gray-900">
              {trained
                ? `Your clone has ${memoriesCount ?? "enough"} training memories saved. Regenerate to see a real prediction with the memories that actually shaped it.`
                : (reasoning ??
                  "I do not know your football instincts yet. I need a few takes before I can clone you properly.")}
            </p>
            {!trained && (
              <p className="text-sm italic text-muted-foreground">
                &ldquo;{trainingQuestion}&rdquo;
              </p>
            )}
          </div>
        </div>

        {trained ? (
          <div className="flex justify-center">
            <PredictButton
              type="button"
              size="default"
              disabled={regenerating}
              onClick={onRegenerate}
            >
              {regenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Regenerating clone...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate clone prediction
                </>
              )}
            </PredictButton>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <PredictButtonLink href="/train" size="default">
                <Brain className="h-4 w-4" />
                Answer training questions
              </PredictButtonLink>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Complete at least 3 training memories, then regenerate your clone.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
