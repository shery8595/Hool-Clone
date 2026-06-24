import Link from "next/link";
import {
  CircleHelp,
  Database,
  Eye,
  MessageCircle,
  ScrollText,
  Sparkles,
  Swords,
} from "lucide-react";
import { buildJudgeDemoClashHref } from "@/lib/clash/featured-arena-opponents";
import {
  DEMO_PROFILE_MEMORY_COUNT,
  DEMO_SLUG,
} from "@/lib/db/demo-memories";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Eye,
    title: "No wallet or training",
    body: `Judges shouldn't need to seed memories first. This URL loads a demo clone with ${DEMO_PROFILE_MEMORY_COUNT} Walrus Mainnet receipts — ready in seconds.`,
    accent: "border-hoolclone-green-400/25 bg-hoolclone-green-800/40",
    iconClass: "text-hoolclone-green-200 bg-hoolclone-green-700/60",
  },
  {
    icon: ScrollText,
    title: "Proof, not marketing",
    body: "Same question → two answers across days, real blob IDs, correction override, and a live write sandbox — every claim is inspectable on one page.",
    accent: "border-hoolclone-yellow-400/30 bg-hoolclone-yellow-500/10",
    iconClass: "text-hoolclone-yellow-300 bg-hoolclone-yellow-500/20",
  },
  {
    icon: Database,
    title: "Walrus drives behavior",
    body: "The clone recalls stored takes before every pick. Change the memories on Walrus and the prediction changes — that's the thesis.",
    accent: "border-emerald-400/25 bg-emerald-900/30",
    iconClass: "text-emerald-300 bg-emerald-700/40",
  },
] as const;

export function JudgeDemoExplainer() {
  const clashHref = buildJudgeDemoClashHref(false);
  const telegramHref = `/u/${DEMO_SLUG}/telegram-history`;

  return (
    <section
      aria-labelledby="judge-demo-explainer-title"
      className="relative overflow-hidden rounded-2xl border border-hoolclone-green-300/60 bg-gradient-to-br from-hoolclone-green-950 via-hoolclone-green-900 to-hoolclone-green-800 text-white shadow-lg"
    >
      <div className="relative space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-yellow-400">
              <CircleHelp className="h-3.5 w-3.5" />
              Why this page exists
            </p>
            <h2
              id="judge-demo-explainer-title"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              One judge URL — verify Walrus memory, not a pitch deck
            </h2>
            <p className="text-sm leading-relaxed text-white/85 sm:text-[15px]">
              HoolClone&apos;s claim is simple:{" "}
              <strong className="font-semibold text-white">
                clone behavior changes because durable Walrus memories are recalled
              </strong>
              , not because we fine-tuned a model. This page is the evidence room —
              pre-loaded with memories written over multiple days, so you can audit
              blob IDs, compare Day 1 vs Day 4+ answers, and write a live correction
              blob without connecting a wallet.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-white/15 bg-hoolclone-green-800/50 p-4 lg:max-w-xs">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-hoolclone-yellow-300">
              15-minute tour
            </p>
            <ol className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex gap-2">
                <span className="font-bold text-hoolclone-yellow-400">1.</span>
                Scroll — same question, two answers + provenance
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-hoolclone-yellow-400">2.</span>
                <Link
                  href="#judge-live-sandbox"
                  className="underline decoration-white/30 underline-offset-2 transition hover:text-white hover:decoration-white"
                >
                  Live sandbox
                </Link>{" "}
                — write a real Walrus correction
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-hoolclone-yellow-400">3.</span>
                Clone Clash — two namespaces debate with receipts
              </li>
            </ol>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className={cn(
                "rounded-xl border p-4",
                pillar.accent,
              )}
            >
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                  pillar.iconClass,
                )}
              >
                <pillar.icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <p className="mt-3 text-sm font-bold text-white">{pillar.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/75">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <ButtonLink
            href="#judge-live-sandbox"
            size="sm"
            className="gap-1.5 border-hoolclone-yellow-500/40 bg-hoolclone-yellow-500 text-hoolclone-green-950 shadow-none hover:bg-hoolclone-yellow-400 hover:shadow-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Try live sandbox
          </ButtonLink>
          <ButtonLink
            href={clashHref}
            variant="link"
            size="sm"
            className="gap-1.5 rounded-full border border-white/20 bg-hoolclone-green-800/60 px-4 py-2 text-white no-underline shadow-none hover:border-white/30 hover:bg-hoolclone-green-700/70 hover:text-white hover:no-underline"
          >
            <Swords className="h-3.5 w-3.5" />
            Judge clash
          </ButtonLink>
          <ButtonLink
            href={telegramHref}
            variant="link"
            size="sm"
            className="gap-1.5 rounded-full border border-white/20 bg-hoolclone-green-800/60 px-4 py-2 text-white no-underline shadow-none hover:border-white/30 hover:bg-hoolclone-green-700/70 hover:text-white hover:no-underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Telegram roasts
          </ButtonLink>
          <Link
            href="/docs/judges"
            className="ml-auto text-xs font-medium text-white/70 underline-offset-2 transition hover:text-white hover:underline"
          >
            Full judges guide →
          </Link>
        </div>
      </div>
    </section>
  );
}
