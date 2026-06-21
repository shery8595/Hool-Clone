const SOURCE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  clone_correction: "Your correction",
  correction: "Your correction",
  debate: "Debate correction",
  prediction_submit: "Your prediction",
  prediction: "Past prediction",
  telegram_post_match: "Post-match memory",
  telegram_live_goal: "Live goal reaction",
  match_resolution: "Match result",
  debate_highlight: "Debate highlight",
};

function daysAgoLabel(isoDate: string | undefined): string | null {
  if (!isoDate) return null;
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.max(
    0,
    Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000)),
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function formatMemorySourceLabel(
  source: string | undefined,
): string | undefined {
  if (!source) return undefined;
  return SOURCE_LABELS[source] ?? source.replace(/_/g, " ");
}

export function formatProvenanceLabel(
  source: string | undefined,
  createdAt: string | undefined,
  matchId?: string | null,
): string | undefined {
  const sourceLabel = formatMemorySourceLabel(source);
  const ago = daysAgoLabel(createdAt);
  if (!sourceLabel && !ago) return undefined;

  const parts: string[] = [];
  if (sourceLabel) parts.push(sourceLabel);
  if (matchId && source === "prediction_submit") {
    parts.push("same match");
  }
  if (ago) parts.push(ago);

  return parts.join(" · ");
}
