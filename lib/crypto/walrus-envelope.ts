import type { MemoryRecord } from "@/lib/memory/memory-adapter";

function escapeSearchText(value: string): string {
  return value.replace(/"/g, "'");
}

export function buildEncryptedWalrusPayload(
  memory: MemoryRecord,
  input: {
    searchText: string;
    ciphertextB64: string;
    nonceB64: string;
    version?: string;
  },
): string {
  const meta = memory.metadata ?? {};
  const version = input.version ?? "v1";
  const tags: string[] = [
    `[${memory.type}]`,
    `search:"${escapeSearchText(input.searchText)}"`,
    `enc:${version}:${input.ciphertextB64}:${input.nonceB64}`,
  ];

  if (typeof meta.team === "string") tags.push(`team:${meta.team}`);
  if (typeof meta.driver === "string") tags.push(`driver:${meta.driver}`);
  if (typeof meta.source === "string") tags.push(`source:${meta.source}`);

  return tags.join(" ");
}

export function parseEncryptedEnvelope(raw: string): {
  searchText?: string;
  ciphertextB64?: string;
  nonceB64?: string;
  version?: string;
} {
  const searchMatch = raw.match(/search:"([^"]*)"/i);
  const encMatch = raw.match(/enc:(v\d+):([^:\s]+):([^:\s]+)/i);

  return {
    searchText: searchMatch?.[1],
    version: encMatch?.[1],
    ciphertextB64: encMatch?.[2],
    nonceB64: encMatch?.[3],
  };
}

export function isEncryptedMemoryMetadata(
  metadata: Record<string, unknown>,
): boolean {
  return metadata.encrypted === true;
}

export function recallTextForMemory(
  text: string,
  metadata: Record<string, unknown>,
): string {
  if (!isEncryptedMemoryMetadata(metadata)) return text;
  const searchText = metadata.searchText;
  return typeof searchText === "string" && searchText.trim().length > 0
    ? searchText
    : text;
}
