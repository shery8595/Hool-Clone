/** Inverse of formatWalrusPayload in walrus-memory-adapter.ts */
import { parseEncryptedEnvelope } from "@/lib/crypto/walrus-envelope";

export function parseBlobPayload(raw: string): {
  type: string;
  text: string;
  tags: Record<string, string>;
  encrypted?: {
    searchText?: string;
    ciphertextB64?: string;
    nonceB64?: string;
    version?: string;
  };
} {
  const encrypted = parseEncryptedEnvelope(raw);
  const trimmed = raw.trim();
  if (!trimmed) {
    return { type: "unknown", text: "", tags: {} };
  }

  const typeMatch = trimmed.match(/^\[([^\]]+)\]/);
  const type = typeMatch?.[1]?.trim() ?? "unknown";
  let remainder = typeMatch ? trimmed.slice(typeMatch[0].length).trim() : trimmed;

  // Strip quoted search and enc tags before generic tag parsing
  remainder = remainder
    .replace(/search:"[^"]*"/gi, " ")
    .replace(/enc:v\d+:\S+:\S+/gi, " ");

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

  if (encrypted.searchText) {
    text = encrypted.searchText;
  }

  const result = { type, text, tags };
  if (encrypted.ciphertextB64) {
    return { ...result, encrypted };
  }
  return result;
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
