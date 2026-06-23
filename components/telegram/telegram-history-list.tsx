"use client";

import { useMemo, useState } from "react";
import { Flame, Radio, Trophy, Zap } from "lucide-react";
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

type HistoryFilter = "all" | "live_goal" | "post_match";

const FILTER_OPTIONS: {
  id: HistoryFilter;
  label: string;
  icon: typeof Zap;
}[] = [
  { id: "all", label: "All", icon: Radio },
  { id: "live_goal", label: "Live goals", icon: Zap },
  { id: "post_match", label: "Roasts & congrats", icon: Flame },
];

function formatMatchLabel(item: TelegramHistoryItem): string | null {
  if (!item.match?.teamACode || !item.match.teamBCode) return null;
  const score =
    item.match.scoreA != null && item.match.scoreB != null
      ? ` (${item.match.scoreA}-${item.match.scoreB})`
      : "";
  return `${item.match.teamACode} vs ${item.match.teamBCode}${score}`;
}

function roastTitleForType(messageType: TelegramMessageType): string | undefined {
  if (messageType === "on_demand_roast") {
    return "On-demand roast from your clone";
  }
  return undefined;
}

function matchesFilter(item: TelegramHistoryItem, filter: HistoryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "live_goal") return item.messageType === "live_goal";
  return (
    item.messageType === "post_match_roast" ||
    item.messageType === "post_match_congrats" ||
    item.messageType === "on_demand_roast"
  );
}

export function TelegramHistoryList({
  messages,
}: {
  messages: TelegramHistoryItem[];
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const counts = useMemo(
    () => ({
      liveGoals: messages.filter((m) => m.messageType === "live_goal").length,
      postMatch: messages.filter(
        (m) =>
          m.messageType === "post_match_roast" ||
          m.messageType === "post_match_congrats" ||
          m.messageType === "on_demand_roast",
      ).length,
    }),
    [messages],
  );

  const filtered = useMemo(
    () => messages.filter((item) => matchesFilter(item, filter)),
    [messages, filter],
  );

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-8 text-center text-sm text-muted-foreground">
        No Telegram messages yet. Link Telegram on the dashboard and enable
        notifications to receive live goal and post-match clone messages.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white px-4 py-3">
          <div className="flex items-center gap-2 text-amber-900">
            <Zap className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Live goals
            </p>
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-950">
            {counts.liveGoals}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white px-4 py-3">
          <div className="flex items-center gap-2 text-rose-900">
            <Flame className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Roasts
            </p>
          </div>
          <p className="mt-1 text-2xl font-bold text-rose-950">
            {
              messages.filter(
                (m) =>
                  m.messageType === "post_match_roast" ||
                  m.messageType === "on_demand_roast",
              ).length
            }
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white px-4 py-3">
          <div className="flex items-center gap-2 text-emerald-900">
            <Trophy className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Congrats
            </p>
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-950">
            {
              messages.filter((m) => m.messageType === "post_match_congrats")
                .length
            }
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter Telegram messages"
      >
        {FILTER_OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              filter === id
                ? "bg-hoolclone-green-900 text-white shadow-sm"
                : "bg-white text-muted-foreground ring-1 ring-hoolclone-green-100 hover:bg-hoolclone-green-50 hover:text-hoolclone-green-900",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-8 text-center text-sm text-muted-foreground">
          No messages in this category yet.
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((item) => {
            const matchLabel = formatMatchLabel(item);

            return (
              <article key={item.id} className="space-y-3">
                <TelegramShareCard
                  messageType={item.messageType}
                  body={item.body}
                  matchLabel={matchLabel}
                  sentAt={item.sentAt}
                  citedMemories={item.citedMemories}
                  recallSource={
                    item.recallSource === "none" ? undefined : item.recallSource
                  }
                  roastTitle={roastTitleForType(item.messageType)}
                />

                {(item.citedMemories.length > 0 ||
                  item.recalledMemories.length > 0) && (
                  <TelegramMemoryReceipts
                    citedMemories={item.citedMemories}
                    recalledMemories={item.recalledMemories}
                    recallSource={item.recallSource}
                    citationSource={item.citationSource}
                    citationWarnings={item.citationWarnings}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
