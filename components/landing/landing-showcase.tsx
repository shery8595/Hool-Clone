"use client";

import { useState } from "react";
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Database,
  Flame,
  MessageCircle,
  Shield,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BiasRadarChart } from "@/components/charts/bias-radar-chart";
import { showcaseFans, showcaseStats, DEMO_EVOLUTION_URL } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

const statIconMap = {
  brain: Brain,
  target: Target,
  database: Database,
  shield: Shield,
} as const;

const titleIconMap = {
  target: Target,
  zap: Zap,
  trophy: Trophy,
} as const;

const bottomFeatures = [
  {
    icon: Brain,
    label: "Built from your takes, biases and contradictions.",
  },
  {
    icon: Shield,
    label: "Durably stored on Walrus Mainnet.",
  },
  {
    icon: Target,
    label: "Powers predictions, debates and roasts.",
  },
  {
    icon: Users,
    label: "Climb the leaderboard. Prove your clone is real.",
  },
] as const;

export function LandingShowcase() {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((i) => (i === 0 ? showcaseFans.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === showcaseFans.length - 1 ? 0 : i + 1));

  return (
    <section
      id="leaderboard"
      className="relative overflow-hidden border-t border-border/60 py-16 lg:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        aria-hidden
        style={{
          backgroundImage: "url(/landing/built-to-know-you-bg.png)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-white/55"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6" data-reveal-section>
        <div
          className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between"
          data-reveal-item
        >
          <div className="max-w-xl">
            <h2 className="text-2xl font-black uppercase leading-tight tracking-tight text-hoolclone-gray-900 sm:text-3xl lg:text-[2rem]">
              Fans Worldwide.{" "}
              <span className="relative inline-block text-hoolclone-green-800">
                Clones That Hit Hard.
                <span
                  className="absolute -bottom-1 left-0 h-2 w-full -skew-x-3 rounded-sm bg-hoolclone-yellow-500/90"
                  aria-hidden
                />
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Real fan clones with bias radars, maturity levels, and match
              accuracy — built from Walrus-backed memories.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:max-w-2xl">
            {showcaseStats.map(({ label, value, icon }) => {
              const Icon = statIconMap[icon];
              return (
                <div
                  key={label}
                  className="rounded-xl border border-white/70 bg-white/80 px-3 py-3 text-center shadow-sm backdrop-blur-sm"
                >
                  <Icon className="mx-auto h-4 w-4 text-hoolclone-green-700" />
                  <p className="mt-1.5 text-lg font-black text-hoolclone-gray-900">
                    {value}
                  </p>
                  <p className="text-[10px] font-medium leading-tight text-muted-foreground">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end" data-reveal-item>
          <ButtonLink
            href={DEMO_EVOLUTION_URL}
            size="sm"
            className="gap-2 rounded-full px-5 shadow-[0_8px_24px_rgba(10,61,46,0.2)]"
          >
            <Trophy className="h-4 w-4 text-hoolclone-yellow-500" />
            View Leaderboard
            <ChevronRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        <div className="mt-8 flex items-stretch gap-3 lg:gap-4" data-reveal-item>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-12 w-12 shrink-0 rounded-full border-white/80 bg-white/90 shadow-md backdrop-blur-sm lg:flex"
            onClick={prev}
            aria-label="Previous fan"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-3 lg:gap-5">
            {showcaseFans.map((fan, i) => (
              <FanCard
                key={fan.handle}
                fan={fan}
                active={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "lg:block",
                  i !== index && "hidden lg:block",
                )}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="hidden h-12 w-12 shrink-0 rounded-full border-white/80 bg-white/90 shadow-md backdrop-blur-sm lg:flex"
            onClick={next}
            aria-label="Next fan"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-white/80 bg-white/90"
            onClick={prev}
            aria-label="Previous fan"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {showcaseFans.map((fan, i) => (
              <button
                key={fan.handle}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${fan.handle}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index
                    ? "w-6 bg-hoolclone-green-700"
                    : "w-2 bg-hoolclone-green-200",
                )}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-white/80 bg-white/90"
            onClick={next}
            aria-label="Next fan"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="relative mt-10 overflow-hidden rounded-2xl bg-hoolclone-green-900 px-5 py-5 shadow-[0_16px_48px_rgba(10,61,46,0.25)] sm:px-8 sm:py-6"
          data-reveal-item
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/showcase/fan-alexfan.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-4 -left-2 hidden h-36 w-32 object-contain object-bottom sm:block lg:h-44 lg:w-40"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-md text-lg font-black uppercase leading-tight tracking-tight text-white sm:text-xl lg:pl-36">
              Every clone is unique.{" "}
              <span className="text-hoolclone-yellow-500">
                Every memory is real.
              </span>
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {bottomFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-hoolclone-yellow-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] leading-snug text-white/85">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FanCard({
  fan,
  active,
  onClick,
  className,
}: {
  fan: (typeof showcaseFans)[number];
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const TitleIcon = titleIconMap[fan.titleIcon];

  const content = (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_12px_40px_rgba(10,61,46,0.1)] ring-1 ring-transparent backdrop-blur-sm transition-all duration-300 ease-out",
        "group-hover:-translate-y-2 group-hover:border-hoolclone-green-500/35 group-hover:bg-white group-hover:shadow-[0_24px_56px_rgba(10,61,46,0.18)] group-hover:ring-hoolclone-green-500/20",
        active && "lg:-translate-y-1 lg:shadow-[0_20px_50px_rgba(10,61,46,0.16)]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="relative border-b border-border/40 px-3 pb-3 pt-2 sm:px-4">
        <RankBadge rank={fan.rank} />

        <div className="absolute right-3 top-3 text-right sm:right-4 sm:top-4">
          <p className="text-2xl font-black leading-none text-hoolclone-gray-900 transition-colors duration-300 group-hover:text-hoolclone-green-800 sm:text-3xl">
            {fan.matchPercent}
            <span className="text-lg">%</span>
          </p>
          <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Clone matched me
          </p>
        </div>

        <div className="flex items-end gap-1 pr-24 sm:gap-2 sm:pr-28">
          <div className="relative -ml-1 h-[6.75rem] w-[5.75rem] shrink-0 sm:-ml-2 sm:h-[7.75rem] sm:w-[6.75rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fan.avatar}
              alt=""
              className={cn(
                "absolute bottom-0 left-0 h-[115%] w-[115%] max-w-none object-contain object-bottom-left transition-transform duration-500 ease-out group-hover:scale-[1.06]",
                fan.rank === 3 ? "-translate-x-[8%]" : "-translate-x-[5%]",
              )}
            />
          </div>

          <div className="min-w-0 flex-1 pb-1 pt-8 sm:pt-9">
            <p className="truncate text-sm font-bold text-hoolclone-gray-900 sm:text-base">
              {fan.handle}
            </p>
            <p className="text-xs text-muted-foreground">Level {fan.level}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-hoolclone-green-100 bg-hoolclone-green-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-hoolclone-green-800 transition-colors duration-300 group-hover:border-hoolclone-green-300 group-hover:bg-hoolclone-green-100">
              <TitleIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{fan.title}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-1 px-2 py-3 sm:gap-2 sm:px-3">
        <div className="min-w-0">
          <BiasRadarChart
            data={fan.radar}
            title=""
            description=""
            showLegend={false}
            showStats={false}
            compact
            bare
          />
        </div>

        <ul className="flex flex-col justify-center gap-2 py-1 pr-1">
          <FanStat icon={Brain} label="Memories" value={String(fan.memories)} />
          <FanStat
            icon={Target}
            label="Predictions"
            value={String(fan.predictions)}
          />
          <FanStat
            icon={MessageCircle}
            label="Debates Won"
            value={String(fan.debatesWon)}
          />
          <FanStat
            icon={Flame}
            label="Roast Level"
            value={`${fan.roastLevel}/10`}
          />
        </ul>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/40 bg-hoolclone-gray-50/80 px-3 py-2.5 transition-colors duration-300 group-hover:border-hoolclone-green-200/60 group-hover:bg-hoolclone-green-50/90 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-3.5 w-3.5 shrink-0 text-hoolclone-green-700" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-hoolclone-gray-900">
              Walrus Verified
            </p>
            <p className="truncate text-[9px] text-muted-foreground">
              All memories stored on Walrus Mainnet
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="text-right">
            <p className="text-[9px] font-medium text-muted-foreground">
              Latest Receipt
            </p>
            <p className="font-mono text-[10px] font-semibold text-hoolclone-gray-900">
              {fan.receipt}
            </p>
          </div>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hoolclone-green-700 text-white transition-transform duration-300 group-hover:scale-110">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" className="group w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className="group">{content}</div>;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="absolute left-0 top-0 z-20 flex h-7 w-9 items-center justify-center rounded-br-lg rounded-tl-2xl bg-hoolclone-green-800 text-white shadow-sm">
        <Crown className="h-3.5 w-3.5 text-hoolclone-yellow-500" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute left-0 top-0 z-20 flex h-7 min-w-[2rem] items-center justify-center rounded-br-lg rounded-tl-2xl px-1.5 text-[11px] font-black text-white shadow-sm",
        rank === 2 ? "bg-zinc-500" : "bg-amber-700",
      )}
    >
      #{rank}
    </div>
  );
}

function FanStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-hoolclone-green-700" />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] leading-none text-muted-foreground">{label}</p>
        <p className="text-sm font-bold leading-tight text-hoolclone-gray-900">
          {value}
        </p>
      </div>
    </li>
  );
}
