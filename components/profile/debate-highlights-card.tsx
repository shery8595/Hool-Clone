import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/mock/demo-user";
import type { DebateHighlight } from "@/lib/mock/types";

type DebateHighlightsCardProps = {
  highlights: DebateHighlight[];
};

export function DebateHighlightsCard({ highlights }: DebateHighlightsCardProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-5 w-5 text-hoolclone-green-700" />
          Debate highlights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Summaries from clone debates — stored as Walrus memory receipts.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlights.map((highlight) => (
          <article
            key={highlight.id}
            className="rounded-xl border border-border bg-white p-4"
          >
            <p className="text-sm leading-relaxed">{highlight.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {highlight.exchangeCount} exchanges · {highlight.citedMemoryCount}{" "}
              memories cited · {formatDate(highlight.date)}
            </p>
            {highlight.topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {highlight.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-hoolclone-green-100 px-2 py-0.5 text-[10px] font-medium text-hoolclone-green-900"
                  >
                    {topic.length > 48 ? `${topic.slice(0, 48)}…` : topic}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
