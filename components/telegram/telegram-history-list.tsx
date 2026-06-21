"use client";

import type { TelegramMessageType } from "@/lib/telegram/send-and-store";
import type { CitationSource } from "@/lib/telegram/citation-enforcement";
import type { MessageRecallBackend } from "@/lib/telegram/message-recall-backend";
import type { RecalledMemorySnapshot } from "@/lib/telegram/recalled-memory-snapshot";
import {
  TelegramMemoryReceipts,
  type TelegramCitedMemory,
} from "@/components/telegram/telegram-memory-receipts";
import { TelegramShareCard } from "@/components/telegram/telegram-share-card";
import { cn } from "@/lib/utils";

export type TelegramHistoryItem = {
  id: string;
  matchId: string | null;
  messageType: TelegramMessageType;
  body: string;
  metadata: Record<string, unknown>;
  sentAt: string;
  recallSource?: MessageRecallBackend;
  citationSource?: CitationSource;
  citationWarnings?: string[];
  citedMemories: TelegramCitedMemory[];
  recalledMemories: RecalledMemorySnapshot[];
  match: {
    externalId: string;
    teamACode: string | null;
    teamBCode: string | null;
    scoreA: number | null;
    scoreB: number | null;
  } | null;
};

const TYPE_LABELS: Record<TelegramMessageType, string> = {
  live_goal: "Live goal",
  post_match_roast: "Post-match roast",
  post_match_congrats: "Post-match congrats",
  on_demand_roast: "On-demand roast",
};

function formatMatchLabel(item: TelegramHistoryItem): string | null {
  if (!item.match?.teamACode || !item.match.teamBCode) return null;
  const score =
    item.match.scoreA != null && item.match.scoreB != null
      ? ` (${item.match.scoreA}-${item.match.scoreB})`
      : "";
  return `${item.match.teamACode} vs ${item.match.teamBCode}${score}`;
}

export function TelegramHistoryList({
  messages,
}: {
  messages: TelegramHistoryItem[];
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-8 text-center text-sm text-muted-foreground">
        No Telegram messages yet. Link Telegram on the dashboard and enable
        notifications to receive live goal and post-match clone messages.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((item) => {
        const matchLabel = formatMatchLabel(item);

        return (
          <article
            key={item.id}
            className="rounded-2xl border border-hoolclone-green-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  item.messageType === "live_goal"
                    ? "bg-hoolclone-yellow-100 text-hoolclone-green-900"
                    : item.messageType === "post_match_congrats"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-rose-100 text-rose-900",
                )}
              >
                {TYPE_LABELS[item.messageType]}
              </span>
              <time className="text-xs text-muted-foreground">
                {new Date(item.sentAt).toLocaleString()}
              </time>
            </div>

            {matchLabel && (
              <p className="mb-2 text-sm font-medium text-hoolclone-green-900">
                {matchLabel}
              </p>
            )}

            {(item.messageType === "post_match_roast" ||
              item.messageType === "post_match_congrats") && (
              <TelegramShareCard
                messageType={item.messageType}
                body={item.body}
                matchLabel={matchLabel}
                sentAt={item.sentAt}
                citedMemories={item.citedMemories}
                recallSource={
                  item.recallSource === "none" ? undefined : item.recallSource
                }
                className="mb-4"
              />
            )}

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {item.body}
            </p>

            <TelegramMemoryReceipts
              citedMemories={item.citedMemories}
              recalledMemories={item.recalledMemories}
              recallSource={item.recallSource}
              citationSource={item.citationSource}
              citationWarnings={item.citationWarnings}
            />
          </article>
        );
      })}
    </div>
  );
}
