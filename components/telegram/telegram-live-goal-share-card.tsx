"use client";

import { useState } from "react";
import {
  Brain,
  Calendar,
  Camera,
  Check,
  Clock,
  Database,
  Radio,
  Share,
  Zap,
} from "lucide-react";
import { HOOLCLONE_LOGO_SRC } from "@/components/brand/hoolclone-logo";
import type { RecallSource } from "@/lib/mock/types";
import type { TelegramCitedMemory } from "@/components/telegram/telegram-memory-receipts";
import {
  flagSrcForCode,
  formatSourceLabel,
  parseMatchLabel,
  primaryQuoteFromBody,
  splitQuoteHighlight,
} from "@/lib/telegram/parse-share-card";
import { cn } from "@/lib/utils";

type TelegramLiveGoalShareCardProps = {
  body: string;
  matchLabel?: string | null;
  sentAt: string;
  citedMemories: TelegramCitedMemory[];
  recallSource?: RecallSource;
  className?: string;
};

function MiniFlag({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  const src = flagSrcForCode(code);

  if (failed) {
    return (
      <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {code}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${code} flag`}
      className="h-4 w-6 rounded-sm object-cover shadow-sm ring-1 ring-white/30"
      onError={() => setFailed(true)}
    />
  );
}

export function TelegramLiveGoalShareCard({
  body,
  matchLabel,
  sentAt,
  citedMemories,
  recallSource,
  className,
}: TelegramLiveGoalShareCardProps) {
  const parsed = parseMatchLabel(matchLabel);
  const quote = primaryQuoteFromBody(body);
  const { lead, highlight } = splitQuoteHighlight(quote);
  const topMemory = citedMemories[0];
  const sent = new Date(sentAt);

  const scoreLabel =
    parsed?.scoreA != null && parsed?.scoreB != null
      ? `${parsed.scoreA}-${parsed.scoreB}`
      : null;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-amber-500/20 bg-white shadow-[0_20px_50px_-12px_rgba(180,83,9,0.28)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-hoolclone-yellow-400/30 blur-2xl"
        aria-hidden
      />

      <header className="relative overflow-hidden bg-gradient-to-br from-[#7c5a00] via-[#b8860b] to-[#5c4300] px-5 pb-5 pt-4 text-white">
        <div className="relative space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HOOLCLONE_LOGO_SRC}
                alt=""
                className="h-8 w-8 rounded-full ring-2 ring-white/20"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                HoolClone · Live
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-hoolclone-yellow-100 ring-1 ring-white/20">
              <Radio className="h-3 w-3 animate-pulse" />
              Live goal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-hoolclone-yellow-300" />
            <h3 className="text-xl font-bold leading-tight sm:text-2xl">
              GOAL! Your clone reacted
            </h3>
          </div>

          {parsed && (
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <MiniFlag code={parsed.teamA} />
              <span>
                {parsed.teamA}{" "}
                <span className="text-white/75">vs</span> {parsed.teamB}
              </span>
              {scoreLabel && (
                <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-hoolclone-yellow-100">
                  {scoreLabel}
                </span>
              )}
              <MiniFlag code={parsed.teamB} />
            </div>
          )}
        </div>
      </header>

      <div className="relative px-5 pb-4 pt-5">
        <span
          className="font-serif text-7xl font-bold leading-none text-amber-700/40"
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="relative -mt-6 text-lg font-medium leading-relaxed text-amber-950">
          {lead}
          {highlight ? (
            <>
              {" "}
              <span className="font-bold text-amber-700">{highlight}.</span>
            </>
          ) : null}
        </blockquote>
      </div>

      {topMemory && (
        <div className="mx-5 mb-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="border-l-[3px] border-amber-500 pl-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              <Brain className="h-3.5 w-3.5" />
              Recalled from Walrus memory
            </p>
            <p className="mt-2 text-sm leading-snug text-amber-950">
              &ldquo;{topMemory.text}&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-900">
                <Check className="h-3 w-3 text-amber-600" />
                Walrus verified
              </span>
              {topMemory.source && (
                <span className="text-[10px] font-medium capitalize text-muted-foreground">
                  {formatSourceLabel(topMemory.source)}
                </span>
              )}
              {recallSource === "walrus" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-900">
                  <Database className="h-3 w-3" />
                  Walrus: verified recall
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-100/80 bg-amber-50/40 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {sent.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {sent.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-amber-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HOOLCLONE_LOGO_SRC} alt="" className="h-3.5 w-3.5 rounded-full" />
            #Walrus
          </span>
          <span className="inline-flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" />
            Screenshot-ready
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-hoolclone-yellow-500 text-hoolclone-gray-900 shadow-sm transition hover:bg-hoolclone-yellow-500/90"
          title="Share screenshot"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              void navigator.share({
                title: "HoolClone live goal",
                text: quote,
              }).catch(() => undefined);
            }
          }}
        >
          <Share className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
