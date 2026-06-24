"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { TelegramRoastShareCard } from "@/components/telegram/telegram-roast-share-card";
import type { RoastRecordData } from "@/lib/clone/judge-proof-demo";

type RoastRecordSectionProps = {
  data: RoastRecordData;
  telegramHistoryHref?: string;
  className?: string;
};

export function RoastRecordSection({
  data,
  telegramHistoryHref = "/telegram-history",
  className,
}: RoastRecordSectionProps) {
  return (
    <section className={className}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Flame className="h-5 w-5 text-rose-600" />
            Roast my record
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Screenshot-ready card: wrong pick, match result, cited Walrus memory.
          </p>
        </div>
        <Link
          href={telegramHistoryHref}
          className="text-xs font-semibold text-hoolclone-green-800 hover:underline"
        >
          Full Telegram loop →
        </Link>
      </div>
      <div className="mx-auto max-w-md">
        <TelegramRoastShareCard
          body={data.body}
          matchLabel={data.matchLabel}
          sentAt={data.sentAt}
          citedMemories={data.citedMemories}
          recallSource="walrus"
        />
      </div>
    </section>
  );
}
