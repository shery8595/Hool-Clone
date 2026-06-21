export type ParsedMatchLabel = {
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  raw: string;
};

export function parseMatchLabel(label: string | null | undefined): ParsedMatchLabel | null {
  if (!label?.trim()) return null;

  const match = label.trim().match(
    /^([A-Za-z]{3})\s+vs\s+([A-Za-z]{3})(?:\s*\((\d+)\s*[-–]\s*(\d+)\))?/i,
  );
  if (!match) return { teamA: "?", teamB: "?", raw: label };

  return {
    teamA: match[1].toUpperCase(),
    teamB: match[2].toUpperCase(),
    scoreA: match[3] ? Number(match[3]) : undefined,
    scoreB: match[4] ? Number(match[4]) : undefined,
    raw: label,
  };
}

export function flagSrcForCode(code: string): string {
  return `/flags/${code.toLowerCase()}.svg`;
}

/** First paragraph of DM body, strip receipt footer lines */
export function primaryQuoteFromBody(body: string): string {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const quoteLines: string[] = [];
  for (const line of lines) {
    if (
      line.startsWith("Memory Receipts") ||
      line.startsWith("Receipt:") ||
      /^#[A-Z]\s/.test(line)
    ) {
      break;
    }
    quoteLines.push(line);
  }
  const joined = quoteLines.join(" ").replace(/^["“]|["”]$/g, "").trim();
  return joined || body.split("\n")[0]?.trim() || "";
}

/** Split quote into lead + highlighted closing sentence */
export function splitQuoteHighlight(quote: string): {
  lead: string;
  highlight: string | null;
} {
  const trimmed = quote.trim();
  const lastPeriod = trimmed.lastIndexOf(". ");
  if (lastPeriod === -1) {
    return { lead: trimmed, highlight: null };
  }
  const lead = trimmed.slice(0, lastPeriod + 1).trim();
  const highlight = trimmed.slice(lastPeriod + 2).replace(/\.$/, "").trim();
  if (!highlight || highlight.length < 8) {
    return { lead: trimmed, highlight: null };
  }
  return { lead, highlight };
}

export function formatSourceLabel(source: string | undefined): string {
  if (!source) return "";
  return source.replace(/_/g, " ");
}
