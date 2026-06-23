import Link from "next/link";
import { ArrowRight, Brain, Database, MessageCircle, Target } from "lucide-react";
import type { CloneMaturity } from "@/lib/mock/types";
import {
  DashboardPanel,
  DashboardSectionHeader,
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
};

export function DashboardFlywheel({
  memoriesCount,
  predictionsCount,
  maturityLabel,
}: DashboardFlywheelProps) {
  const ctx = { memories: memoriesCount, predictions: predictionsCount };
  const activeLayers = layers.filter((layer) => layer.isActive(ctx)).length;

  return (
    <DashboardPanel>
      <DashboardSectionHeader
        eyebrow="Workflow"
        title="The HoolClone flywheel"
        description={`${activeLayers} of ${layers.length} layers active · ${maturityLabel}`}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          const active = layer.isActive(ctx);

          return (
            <div key={layer.step} className="relative flex items-stretch">
              <Link href={layer.href} className="group min-w-0 flex-1">
                <div
                  className={cn(
                    "relative h-full rounded-xl border p-4 transition-all",
                    active
                      ? "border-hoolclone-green-200 bg-gradient-to-br from-hoolclone-green-50/80 to-white shadow-sm"
                      : "border-border/50 bg-muted/10 hover:border-hoolclone-green-200/70 hover:bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border",
                        active
                          ? "border-hoolclone-green-800 bg-hoolclone-green-800 text-white"
                          : "border-border bg-white text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                      {String(layer.step).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-3 font-semibold text-hoolclone-gray-900">
                    {layer.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {layer.subtitle}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-hoolclone-green-800 opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              {index < layers.length - 1 && (
                <span
                  className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-muted-foreground/30 xl:block"
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
