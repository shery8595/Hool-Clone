import { MessageCircle } from "lucide-react";
import { ProfileSection } from "@/components/profile/profile-section";
import { formatDate } from "@/lib/mock/demo-user";
import type { DebateHighlight } from "@/lib/mock/types";

type DebateHighlightsCardProps = {
  highlights: DebateHighlight[];
};

export function DebateHighlightsCard({ highlights }: DebateHighlightsCardProps) {
  return (
    <ProfileSection
      eyebrow="Debate"
      title="Debate highlights"
      description="Summaries from clone debates — stored as Walrus memory receipts."
      variant="highlight"
    >
      <div className="space-y-3">
        {highlights.map((highlight) => (
          <article
            key={highlight.id}
            className="rounded-xl border border-hoolclone-green-100/80 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-hoolclone-green-700" />
              <p className="text-sm leading-relaxed text-foreground/90">
                {highlight.summary}
              </p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {highlight.exchangeCount} exchanges · {highlight.citedMemoryCount}{" "}
              memories cited · {formatDate(highlight.date)}
            </p>
            {highlight.topics.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
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
      </div>
    </ProfileSection>
  );
}
