"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { HoolCloneLoader } from "@/components/brand/hoolclone-loader";
import {
  TelegramHistoryList,
  type TelegramHistoryItem,
} from "@/components/telegram/telegram-history-list";
import { TelegramShareCard } from "@/components/telegram/telegram-share-card";
import { SAMPLE_CONGRATS_CARD, SAMPLE_ROAST_CARD } from "@/lib/telegram/sample-share-cards";
import { fetchTelegramHistory } from "@/lib/api/client";
import { useUser } from "@/components/providers/user-provider";

export default function TelegramHistoryPage() {
  const { me } = useUser();
  const [messages, setMessages] = useState<TelegramHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me?.id) return;

    let cancelled = false;
    setLoading(true);
    fetchTelegramHistory()
      .then((data) => {
        if (!cancelled) {
          setMessages(data.messages);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load history");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [me?.id]);

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-hoolclone-green-950">
            Telegram history
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see your real DMs. Sample share card preview
            below.
          </p>
        </header>
        <SampleShareCardsPreview />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-hoolclone-green-700">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Telegram
          </span>
        </div>
        <h1 className="text-2xl font-bold text-hoolclone-green-950">
          Telegram history
        </h1>
        <p className="text-sm text-muted-foreground">
          Every live goal reaction and post-match message your clone sent,
          including the memory receipts used in each DM.
        </p>
      </header>

      <SampleShareCardsPreview />

      {loading ? (
        <div className="flex justify-center py-16">
          <HoolCloneLoader label="Loading Telegram history..." />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : (
        <TelegramHistoryList messages={messages} />
      )}
    </div>
  );
}

function SampleShareCardsPreview() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Sample previews
        </h2>
        <span className="rounded-full bg-hoolclone-yellow-100 px-2.5 py-0.5 text-[10px] font-semibold text-hoolclone-green-900">
          Demo — not real DMs
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Post-match congrats — screenshot-ready for #Walrus.
        </p>
        <TelegramShareCard
          messageType={SAMPLE_CONGRATS_CARD.messageType}
          body={SAMPLE_CONGRATS_CARD.body}
          matchLabel={SAMPLE_CONGRATS_CARD.matchLabel}
          sentAt={SAMPLE_CONGRATS_CARD.sentAt}
          citedMemories={SAMPLE_CONGRATS_CARD.citedMemories}
          recallSource={SAMPLE_CONGRATS_CARD.recallSource}
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Post-match roast — cites the memory you ignored.
        </p>
        <TelegramShareCard
          messageType={SAMPLE_ROAST_CARD.messageType}
          body={SAMPLE_ROAST_CARD.body}
          matchLabel={SAMPLE_ROAST_CARD.matchLabel}
          sentAt={SAMPLE_ROAST_CARD.sentAt}
          citedMemories={SAMPLE_ROAST_CARD.citedMemories}
          recallSource={SAMPLE_ROAST_CARD.recallSource}
        />
      </div>
    </section>
  );
}
