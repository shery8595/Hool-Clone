"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Circle } from "lucide-react";
import { fetchTelegramStatus } from "@/lib/api/client";
import type { MeData } from "@/lib/api/client";
import {
  DashboardMiniCard,
  DashboardPanel,
  DashboardSectionHeader,
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

function ProgressRing({ progress }: { progress: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-muted/40"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-hoolclone-green-700 transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-hoolclone-green-900">
        {progress}%
      </span>
    </div>
  );
}

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
        hint: memoriesCount < 3 ? "Recommended next" : undefined,
        href: "/train",
        done: memoriesCount >= 3,
      },
      {
        id: "predict",
        label: "Make your first prediction",
        hint:
          memoriesCount >= 3 && predictionsCount < 1
            ? "Recommended next"
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
        href: "/evolution",
        done: memoriesCount >= 9,
      },
    ],
    [
      memoriesCount,
      predictionsCount,
      telegramLinked,
      me.profile.publicEnabled,
    ],
  );

  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);
  const nextStep = steps.find((step) => !step.done);

  return (
    <DashboardPanel className="h-full">
      <div className="flex items-start gap-4">
        <ProgressRing progress={progress} />
        <div className="min-w-0 flex-1">
          <DashboardSectionHeader
            eyebrow="Onboarding"
            title="Clone setup"
            description={`${completed} of ${steps.length} steps complete`}
            className="border-none pb-0"
          />
        </div>
      </div>

      <ul className="mt-5 space-y-1">
        {steps.map((step) => {
          const row = (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2.5",
                !step.done && step.href && "group",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                  step.done
                    ? "border-hoolclone-green-700 bg-hoolclone-green-700 text-white"
                    : "border-border bg-white",
                )}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/25" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.done
                      ? "text-muted-foreground line-through decoration-border/80"
                      : "text-hoolclone-gray-900",
                  )}
                >
                  {step.label}
                </p>
                {step.hint && !step.done && (
                  <p className="text-[11px] font-medium text-hoolclone-green-800">
                    {step.hint}
                  </p>
                )}
              </div>
              {!step.done && step.href && (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:text-hoolclone-green-800" />
              )}
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
        <DashboardMiniCard className="mt-4 border-dashed border-hoolclone-green-200 bg-hoolclone-green-50/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Up next
          </p>
          <p className="mt-1 text-sm font-semibold text-hoolclone-gray-900">
            {nextStep.label}
          </p>
          {nextStep.href && (
            <Link
              href={nextStep.href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-hoolclone-green-800 hover:underline"
            >
              Continue setup
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </DashboardMiniCard>
      )}
    </DashboardPanel>
  );
}
