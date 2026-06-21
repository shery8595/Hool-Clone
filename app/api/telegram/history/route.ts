import { NextResponse } from "next/server";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { query } from "@/lib/db/client";
import type { RecallSource } from "@/lib/mock/types";
import type { CitationSource } from "@/lib/telegram/citation-enforcement";
import { listTelegramMessagesForUser } from "@/lib/telegram/send-and-store";
import type { CitedMemoryPayload } from "@/lib/telegram/citation-enforcement";
import {
  isMessageRecallBackend,
  type MessageRecallBackend,
} from "@/lib/telegram/message-recall-backend";
import { parseRecalledMemorySnapshots } from "@/lib/telegram/recalled-memory-snapshot";
import type { RecalledMemorySnapshot } from "@/lib/telegram/recalled-memory-snapshot";

export const dynamic = "force-dynamic";

type MemoryHydrationRow = {
  id: string;
  text: string;
  memory_type: string;
  metadata: Record<string, unknown>;
};

function toRecallSource(value: unknown): RecallSource | undefined {
  if (value === "walrus" || value === "postgres_fallback") return value;
  return undefined;
}

function toCitationSource(value: unknown): CitationSource | undefined {
  if (value === "llm" || value === "enforced") return value;
  return undefined;
}

function parseCitedMemories(
  metadata: Record<string, unknown>,
): CitedMemoryPayload[] {
  const raw = metadata.citedMemories;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : undefined,
      text: typeof item.text === "string" ? item.text : "",
      type: typeof item.type === "string" ? item.type : undefined,
      source: typeof item.source === "string" ? item.source : undefined,
      walrusBlobId:
        typeof item.walrusBlobId === "string" ? item.walrusBlobId : undefined,
      recallSource: toRecallSource(item.recallSource),
      citationSource: toCitationSource(item.citationSource),
    }))
    .filter((item) => item.text.length > 0);
}

async function hydrateCitedMemories(
  userId: string,
  metadata: Record<string, unknown>,
): Promise<CitedMemoryPayload[]> {
  const stored = parseCitedMemories(metadata);
  if (stored.length > 0) return stored;

  const ids = Array.isArray(metadata.citedMemoryIds)
    ? metadata.citedMemoryIds.filter((id): id is string => typeof id === "string")
    : [];

  if (ids.length === 0) return [];

  const rows = await query<MemoryHydrationRow>(
    `select id, text, memory_type, metadata
     from memories
     where user_id = $1 and id = any($2::uuid[])`,
    [userId, ids],
  );

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    type: row.memory_type,
    source:
      typeof row.metadata?.source === "string" ? row.metadata.source : undefined,
    walrusBlobId:
      typeof row.metadata?.walrusBlobId === "string"
        ? row.metadata.walrusBlobId
        : undefined,
  }));
}

function resolveMessageRecallBackend(
  metadata: Record<string, unknown>,
  citedMemories: CitedMemoryPayload[],
  recalledMemories: RecalledMemorySnapshot[],
): MessageRecallBackend {
  if (isMessageRecallBackend(metadata.recallSource)) {
    return metadata.recallSource;
  }
  if (citedMemories.some((m) => m.recallSource === "walrus")) return "walrus";
  if (recalledMemories.some((m) => m.recallSource === "walrus")) return "walrus";
  if (
    citedMemories.some((m) => m.recallSource === "postgres_fallback") ||
    recalledMemories.some((m) => m.recallSource === "postgres_fallback")
  ) {
    return "postgres_fallback";
  }
  return recalledMemories.length > 0 || citedMemories.length > 0
    ? "none"
    : "none";
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const rows = await listTelegramMessagesForUser(userId);

    const messages = await Promise.all(
      rows.map(async (row) => {
        const citedMemories = await hydrateCitedMemories(userId, row.metadata);
        const recalledMemories = parseRecalledMemorySnapshots(
          row.metadata.recalledMemories,
        );
        const recallSource = resolveMessageRecallBackend(
          row.metadata,
          citedMemories,
          recalledMemories,
        );

        return {
          id: row.id,
          matchId: row.match_id,
          messageType: row.message_type,
          body: row.body,
          metadata: row.metadata,
          sentAt: row.sent_at.toISOString(),
          recallSource,
          citationSource: toCitationSource(row.metadata.citationSource),
          citationWarnings: Array.isArray(row.metadata.citationWarnings)
            ? row.metadata.citationWarnings.filter(
                (w): w is string => typeof w === "string",
              )
            : [],
          citedMemories,
          recalledMemories,
          match: row.external_id
            ? {
                externalId: row.external_id,
                teamACode: row.team_a_code,
                teamBCode: row.team_b_code,
                scoreA: row.score_a,
                scoreB: row.score_b,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({ messages });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/telegram/history", error);
    return NextResponse.json(
      { error: "Failed to load Telegram history" },
      { status: 500 },
    );
  }
}
