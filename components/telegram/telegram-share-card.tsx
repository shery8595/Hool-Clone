"use client";

import type { TelegramMessageType } from "@/lib/telegram/send-and-store";
import type { RecallSource } from "@/lib/mock/types";
import type { TelegramCitedMemory } from "@/components/telegram/telegram-memory-receipts";
import { TelegramCongratsShareCard } from "@/components/telegram/telegram-congrats-share-card";
import { TelegramRoastShareCard } from "@/components/telegram/telegram-roast-share-card";

type TelegramShareCardProps = {
  messageType: TelegramMessageType;
  body: string;
  matchLabel?: string | null;
  sentAt: string;
  citedMemories: TelegramCitedMemory[];
  recallSource?: RecallSource;
  className?: string;
};

export function TelegramShareCard({
  messageType,
  body,
  matchLabel,
  sentAt,
  citedMemories,
  recallSource,
  className,
}: TelegramShareCardProps) {
  const isShareable =
    messageType === "post_match_roast" ||
    messageType === "post_match_congrats";

  if (!isShareable) return null;

  if (messageType === "post_match_congrats") {
    return (
      <TelegramCongratsShareCard
        body={body}
        matchLabel={matchLabel}
        sentAt={sentAt}
        citedMemories={citedMemories}
        recallSource={recallSource}
        className={className}
      />
    );
  }

  return (
    <TelegramRoastShareCard
      body={body}
      matchLabel={matchLabel}
      sentAt={sentAt}
      citedMemories={citedMemories}
      recallSource={recallSource}
      className={className}
    />
  );
}
