"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { LoadingStatus } from "@/components/brand/hoolclone-loader";
import {
  TelegramHistoryList,
  type TelegramHistoryItem,
} from "@/components/telegram/telegram-history-list";
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
            Connect your wallet to see live goal reactions and post-match
            messages from your clone.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-8 text-center text-sm text-muted-foreground">
          Sign in to view your Telegram DMs.
        </div>
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

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingStatus label="Loading Telegram history..." />
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
