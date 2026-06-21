/** Inverse of formatWalrusPayload in walrus-memory-adapter.ts */
export function parseBlobPayload(raw: string): {
  type: string;
  text: string;
  tags: Record<string, string>;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { type: "unknown", text: "", tags: {} };
  }

  const typeMatch = trimmed.match(/^\[([^\]]+)\]/);
  const type = typeMatch?.[1]?.trim() ?? "unknown";
  let remainder = typeMatch ? trimmed.slice(typeMatch[0].length).trim() : trimmed;

  const tags: Record<string, string> = {};
  const tagPattern = /\b([a-z_]+):(\S+)/gi;
  let tagMatch: RegExpExecArray | null;
  const tagSpans: Array<{ start: number; end: number }> = [];

  while ((tagMatch = tagPattern.exec(remainder)) !== null) {
    tags[tagMatch[1]!.toLowerCase()] = tagMatch[2]!;
    tagSpans.push({ start: tagMatch.index, end: tagMatch.index + tagMatch[0].length });
  }

  let text = remainder;
  for (const span of [...tagSpans].reverse()) {
    text = text.slice(0, span.start) + text.slice(span.end);
  }
  text = text.replace(/\s+/g, " ").trim();

  return { type, text, tags };
}

export type PayloadToken = {
  kind: "type" | "text" | "tag-key" | "tag-value" | "bracket";
  value: string;
};

export function tokenizeBlobPayload(raw: string): PayloadToken[] {
  const parsed = parseBlobPayload(raw);
  const tokens: PayloadToken[] = [];

  if (parsed.type !== "unknown") {
    tokens.push({ kind: "bracket", value: "[" });
    tokens.push({ kind: "type", value: parsed.type });
    tokens.push({ kind: "bracket", value: "] " });
  }

  if (parsed.text) {
    tokens.push({ kind: "text", value: parsed.text });
  }

  for (const [key, value] of Object.entries(parsed.tags)) {
    tokens.push({ kind: "text", value: " " });
    tokens.push({ kind: "tag-key", value: `${key}:` });
    tokens.push({ kind: "tag-value", value: value });
  }

  if (tokens.length === 0) {
    tokens.push({ kind: "text", value: raw });
  }

  return tokens;
}
