"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { fetchTelegramStatus } from "@/lib/api/client";
import type { MeData } from "@/lib/api/client";
import {
  DashboardEyebrow,
  DashboardMiniCard,
  DashboardPanel,
} from "./dashboard-surface";
import { cn } from "@/lib/utils";

type DashboardSetupChecklistProps = {
  me: MeData;
  memoriesCount: number;
  predictionsCount: number;
};

type SetupStep = {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  done: boolean;
};

export function DashboardSetupChecklist({
  me,
  memoriesCount,
  predictionsCount,
}: DashboardSetupChecklistProps) {
  const [telegramLinked, setTelegramLinked] = useState(false);

  useEffect(() => {
    void fetchTelegramStatus()
      .then((status) => setTelegramLinked(status.linked))
      .catch(() => setTelegramLinked(false));
  }, []);

  const steps: SetupStep[] = useMemo(
    () => [
      {
        id: "wallet",
        label: "Connect wallet",
        done: true,
      },
      {
        id: "train",
        label: "Train your clone",
        hint: memoriesCount < 3 ? "Next recommended step" : undefined,
        href: "/train",
        done: memoriesCount >= 3,
      },
      {
        id: "predict",
        label: "Make your first prediction",
        hint:
          memoriesCount >= 3 && predictionsCount < 1
            ? "Next recommended step"
            : undefined,
        href: "/predict",
        done: predictionsCount >= 1,
      },
      {
        id: "memory",
        label: "Store a Walrus memory",
        href: "/memory",
        done: memoriesCount >= 1,
      },
      {
        id: "telegram",
        label: "Connect Telegram",
        href: "#telegram-connect",
        done: telegramLinked,
      },
      {
        id: "public",
        label: "Enable public profile",
        href: "/profile/public",
        done: me.profile.publicEnabled,
      },
      {
        id: "evolution",
        label: "Review clone evolution",
        href: me.publicSlug ? `/u/${me.publicSlug}/evolution` : "/profile/public",
        done: memoriesCount >= 9,
      },
    ],
    [
      memoriesCount,
      predictionsCount,
      telegramLinked,
      me.profile.publicEnabled,
      me.publicSlug,
    ],
  );

  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);
  const nextStep = steps.find((step) => !step.done);

  return (
    <DashboardPanel className="h-full">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <DashboardEyebrow>Your clone setup</DashboardEyebrow>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-hoolclone-gray-900">
            {completed} of {steps.length} complete
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {progress}%
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {completed}/{steps.length}
          </p>
        </div>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-hoolclone-green-700 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="space-y-0">
        {steps.map((step, index) => {
          const row = (
            <div
              className={cn(
                "flex items-start gap-3 py-3",
                index < steps.length - 1 && "border-b border-border/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  step.done
                    ? "border-hoolclone-green-700 bg-hoolclone-green-700 text-white"
                    : "border-border bg-white text-transparent",
                )}
              >
                {step.done ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/30" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.done
                      ? "text-muted-foreground line-through decoration-border"
                      : "text-hoolclone-gray-900",
                  )}
                >
                  {step.label}
                </p>
                {step.hint && !step.done && (
                  <p className="mt-0.5 text-xs text-hoolclone-green-800">
                    {step.hint}
                  </p>
                )}
              </div>
            </div>
          );

          if (step.href && !step.done) {
            return (
              <li key={step.id}>
                <Link href={step.href} className="block rounded-lg hover:bg-muted/30">
                  {row}
                </Link>
              </li>
            );
          }

          return <li key={step.id}>{row}</li>;
        })}
      </ul>

      {nextStep && (
        <DashboardMiniCard className="mt-4 border-dashed bg-muted/20">
          <p className="text-xs text-muted-foreground">Up next</p>
          <p className="mt-1 text-sm font-semibold text-hoolclone-gray-900">
            {nextStep.label}
          </p>
        </DashboardMiniCard>
      )}
    </DashboardPanel>
  );
}
