import Link from "next/link";
import { ArrowRight, Brain, Database, MessageCircle, Target } from "lucide-react";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import type { CloneMood } from "@/lib/clone/clone-mood";
import type { CloneMaturity } from "@/lib/mock/types";
import {
  DashboardEyebrow,
  DashboardMiniCard,
  DashboardPanel,
  DashboardStatusPill,
} from "./dashboard-surface";
import { cn } from "@/lib/utils";

const layers = [
  {
    step: 1,
    title: "Train",
    subtitle: "Fan identity on Walrus",
    href: "/train",
    icon: Brain,
    isActive: ({ memories }: { memories: number; predictions: number }) =>
      memories >= 3,
  },
  {
    step: 2,
    title: "Predict",
    subtitle: "You vs your clone",
    href: "/predict",
    icon: Target,
    isActive: ({ predictions }: { memories: number; predictions: number }) =>
      predictions >= 1,
  },
  {
    step: 3,
    title: "Debate",
    subtitle: "Argue with receipts",
    href: "/debate",
    icon: MessageCircle,
    isActive: ({ memories }: { memories: number; predictions: number }) =>
      memories >= 8,
  },
  {
    step: 4,
    title: "Remember",
    subtitle: "Durable memory loop",
    href: "/memory",
    icon: Database,
    isActive: ({ memories }: { memories: number; predictions: number }) =>
      memories >= 15,
  },
] as const;

type DashboardFlywheelProps = {
  memoriesCount: number;
  predictionsCount: number;
  maturityLabel: CloneMaturity;
  level: number;
  maxLevel: number;
  quote: string | null;
  mood: CloneMood;
};

export function DashboardFlywheel({
  memoriesCount,
  predictionsCount,
  maturityLabel,
  level,
  maxLevel,
  quote,
  mood,
}: DashboardFlywheelProps) {
  const ctx = { memories: memoriesCount, predictions: predictionsCount };
  const activeLayers = layers.filter((layer) => layer.isActive(ctx)).length;

  return (
    <DashboardPanel>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <DashboardEyebrow>The HoolClone flywheel</DashboardEyebrow>
          <h1 className="text-2xl font-semibold tracking-tight text-hoolclone-gray-900 sm:text-[1.75rem] sm:leading-tight">
            Train fuels memory. Memory shapes predictions. Predictions feed the
            roast loop.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Level {level} of {maxLevel} ·{" "}
            <span className="font-medium text-foreground">{maturityLabel}</span>
            {quote ? ` — ${quote}` : ""}
          </p>
          <CloneMoodBadge mood={mood} compact className="mt-1" />
        </div>

        <div className="text-right">
          <DashboardStatusPill active={activeLayers > 0}>
            {activeLayers}/{layers.length} layers active
          </DashboardStatusPill>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          const active = layer.isActive(ctx);

          return (
            <div key={layer.step} className="flex items-stretch gap-2">
              <Link href={layer.href} className="group min-w-0 flex-1">
                <DashboardMiniCard
                  className={cn(
                    "relative h-full hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/30",
                    active && "border-hoolclone-green-200 bg-hoolclone-green-50/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Layer {layer.step}
                    </span>
                    {active && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                        aria-label="Active"
                      />
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border",
                        active
                          ? "border-hoolclone-green-800 bg-hoolclone-green-800 text-white"
                          : "border-border bg-muted/20 text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-hoolclone-gray-900">
                        {layer.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {layer.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-hoolclone-green-800 opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </DashboardMiniCard>
              </Link>
              {index < layers.length - 1 && (
                <span
                  className="hidden self-center text-muted-foreground/40 xl:inline"
                  aria-hidden
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
