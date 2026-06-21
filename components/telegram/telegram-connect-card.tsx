"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchTelegramLinkUrl,
  fetchTelegramStatus,
} from "@/lib/api/client";

type TelegramConnectCardProps = {
  variant?: "default" | "compact";
  onLinked?: () => void;
};

export function TelegramConnectCard({
  variant = "default",
  onLinked,
}: TelegramConnectCardProps) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await fetchTelegramStatus();
      setLinked(status.linked);
      setNotificationsEnabled(status.notificationsEnabled);
      if (status.linked) onLinked?.();
      return status.linked;
    } catch {
      return false;
    }
  }, [onLinked]);

  useEffect(() => {
    void refreshStatus();
    const interval = setInterval(() => {
      void refreshStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const handleGetLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await fetchTelegramLinkUrl();
      setLinkUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create Telegram link",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!linkUrl) return;
    await navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (linked && notificationsEnabled) {
    return (
      <Card className="rounded-2xl border-hoolclone-green-200 bg-hoolclone-green-50/50 shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-hoolclone-green-700" />
          <div>
            <p className="font-semibold text-hoolclone-green-900">
              Telegram connected
            </p>
            <p className="text-sm text-muted-foreground">
              Match alerts are on — congrats or roasts after every result.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-hoolclone-yellow-300 bg-hoolclone-yellow-50 px-4 py-3">
        <p className="text-sm font-semibold text-hoolclone-green-900">
          Get match alerts on Telegram
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your clone DMs you after every result — Walrus-backed congrats or
          roasts.
        </p>
        <Button
          size="sm"
          className="mt-3"
          onClick={() => void handleGetLink()}
          disabled={loading}
        >
          Connect Telegram
        </Button>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-5 w-5 text-hoolclone-green-700" />
          Connect Telegram for match alerts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          One tap in Telegram links your account and turns on alerts. After each
          match, your clone sends a Walrus-backed congrats or roast.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={() => void handleGetLink()} disabled={loading}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {loading ? "Opening Telegram…" : "Open Telegram to connect"}
        </Button>

        {linkUrl && (
          <div className="flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs">
              {linkUrl}
            </code>
            <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
              <Copy className="mr-1 h-3 w-3" />
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Waiting for you to tap Start in Telegram…
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
