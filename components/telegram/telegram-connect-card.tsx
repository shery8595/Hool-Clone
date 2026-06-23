"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchTelegramLinkUrl,
  fetchTelegramStatus,
} from "@/lib/api/client";
import { cn } from "@/lib/utils";

type TelegramConnectCardProps = {
  variant?: "default" | "compact";
  onLinked?: () => void;
  id?: string;
  className?: string;
};

export function TelegramConnectCard({
  variant = "default",
  onLinked,
  id = "telegram-connect",
  className,
}: TelegramConnectCardProps) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [botConfigured, setBotConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await fetchTelegramStatus();
      setLinked(status.linked);
      setNotificationsEnabled(status.notificationsEnabled);
      setBotConfigured(status.botConfigured);
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
      // Use same-tab navigation — window.open after await is blocked by popup blockers.
      window.location.assign(url);
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
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link — select and copy manually.");
    }
  };

  if (linked && notificationsEnabled) {
    if (variant === "compact") {
      return (
        <div
          id={id}
          className={cn(
            "flex flex-col gap-4 rounded-2xl border border-hoolclone-green-200 bg-gradient-to-r from-hoolclone-green-50/80 via-white to-hoolclone-green-50/40 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4",
            className,
          )}
        >
          <div className="flex items-start gap-3 sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hoolclone-green-200 bg-white text-hoolclone-green-700 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-hoolclone-green-900">
                Telegram connected
              </p>
              <p className="text-sm text-muted-foreground">
                Match alerts are on — congrats or roasts after every result.
              </p>
            </div>
          </div>
          <ButtonLink href="/telegram-history" variant="outline" size="sm">
            View Telegram history
          </ButtonLink>
        </div>
      );
    }

    return (
      <Card
        id={id}
        className={cn(
          "rounded-2xl border-hoolclone-green-200 bg-hoolclone-green-50/50 shadow-sm",
          className,
        )}
      >
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

  if (!botConfigured) {
    const shell =
      variant === "compact" ? (
        <div
          id={id}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Telegram bot not configured
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
                Set <code className="rounded bg-white/80 px-1">TELEGRAM_BOT_TOKEN</code>{" "}
                and <code className="rounded bg-white/80 px-1">TELEGRAM_BOT_USERNAME</code>{" "}
                in your environment, then run{" "}
                <code className="rounded bg-white/80 px-1">npm run telegram:webhook</code>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card id={id} className="rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950">
                Telegram bot not configured
              </p>
              <p className="mt-1 text-sm text-amber-900/80">
                Add bot credentials to <code className="rounded bg-white/80 px-1">.env</code>{" "}
                and register the webhook before connecting.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    return shell;
  }

  if (variant === "compact") {
    return (
      <div
        id={id}
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-hoolclone-yellow-300/80 bg-gradient-to-r from-hoolclone-yellow-50 via-white to-amber-50/50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4",
          className,
        )}
      >
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-hoolclone-green-800 shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-hoolclone-green-900">
              Get match alerts on Telegram
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Opens Telegram with a one-time link. Tap Start in the bot to
              finish connecting.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => void handleGetLink()}
            disabled={loading}
          >
            {loading ? "Opening Telegram…" : "Connect Telegram"}
          </Button>
          {linkUrl && (
            <>
              <ButtonLink
                href={linkUrl}
                variant="outline"
                size="sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open link
              </ButtonLink>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopy()}
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </>
          )}
        </div>
        {error && (
          <p className="w-full rounded-md bg-destructive/10 px-2 py-1.5 text-xs font-medium text-destructive sm:col-span-2">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card id={id} className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-5 w-5 text-hoolclone-green-700" />
          Connect Telegram for match alerts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          One tap opens Telegram with a secure link. Tap Start in the bot to link
          your account and turn on alerts.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          type="button"
          onClick={() => void handleGetLink()}
          disabled={loading}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {loading ? "Opening Telegram…" : "Open Telegram to connect"}
        </Button>

        {linkUrl && (
          <div className="flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded bg-muted px-2 py-1 text-xs">
              {linkUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
            >
              <Copy className="mr-1 h-3 w-3" />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <ButtonLink
              href={linkUrl}
              variant="outline"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open link
            </ButtonLink>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          After you tap Start in Telegram, this page will update automatically.
        </p>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
