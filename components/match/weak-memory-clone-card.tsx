import { Brain, Bot } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloneAvatar } from "@/components/clone/clone-avatar";

type WeakMemoryCloneCardProps = {
  trainingQuestion: string;
  reasoning?: string;
};

export function WeakMemoryCloneCard({
  trainingQuestion,
  reasoning,
}: WeakMemoryCloneCardProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-hoolclone-green-700" />
          Your Clone Needs Training
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-hoolclone-yellow-500/20 p-4">
          <CloneAvatar size="sm" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-hoolclone-gray-900">
              {reasoning ??
                "I do not know your football instincts yet. I need a few takes before I can clone you properly."}
            </p>
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{trainingQuestion}&rdquo;
            </p>
          </div>
        </div>
        <ButtonLink
          href="/train"
          className="w-full"
        >
          <Brain className="mr-2 h-4 w-4" />
          Answer training questions
        </ButtonLink>
        <p className="text-center text-xs text-muted-foreground">
          Complete at least 3 training memories, then regenerate your clone.
        </p>
      </CardContent>
    </Card>
  );
}
