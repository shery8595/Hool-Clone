import Link from "next/link";
import {
  Calendar,
  Database,
  Globe,
  Shield,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import { ProfileShareDialog } from "@/components/profile/profile-share-dialog";
import { ProfileClashNavLink } from "@/components/profile/profile-clash-nav-link";
import type { CloneMood } from "@/lib/clone/clone-mood";
import { formatDate } from "@/lib/mock/demo-user";
import type { CloneMaturity } from "@/lib/mock/types";
import { LEADERBOARD_URL } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

export type ProfileHeaderProps = {
  displayName: string;
  handle: string;
  bio: string;
  joinedAt: string;
  maturityLabel: CloneMaturity;
  displayLevel: number;
  displayMaxLevel: number;
  memoriesCount: number;
  predictionsCount: number;
  cloneMatchPercent: number;
  walrusBackedCount: number;
  slug?: string;
  activeTab?: "profile" | "clash";
  cloneMood?: CloneMood | null;
};

export function ProfileHeader({
  displayName,
  handle,
  bio,
  joinedAt,
  maturityLabel,
  displayLevel,
  displayMaxLevel,
  memoriesCount,
  predictionsCount,
  cloneMatchPercent,
  walrusBackedCount,
  slug,
  activeTab = "profile",
  cloneMood,
}: ProfileHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-hoolclone-green-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CloneAvatar size="lg" />
          <div className="min-w-0 space-y-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
                Public clone profile
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-hoolclone-green-950 sm:text-3xl">
                {displayName}&apos;s HoolClone
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                @{handle} · judge-ready insights
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                <Shield className="h-3.5 w-3.5" />
                Walrus-backed clone
              </span>
              <MaturityBadge maturity={maturityLabel} />
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                Level {displayLevel} of {displayMaxLevel}
              </span>
              {cloneMood && <CloneMoodBadge mood={cloneMood} compact />}
            </div>

            {slug && (
              <nav className="flex flex-wrap gap-2">
                <ProfileNavLink
                  href={`/u/${slug}`}
                  active={activeTab === "profile"}
                >
                  Profile
                </ProfileNavLink>
                <ProfileClashNavLink slug={slug} active={activeTab === "clash"} />
                <ProfileNavLink href={LEADERBOARD_URL} active={false}>
                  <Trophy className="h-3.5 w-3.5" />
                  Leaderboard
                </ProfileNavLink>
              </nav>
            )}

            {bio && (
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                Shareable judge URL
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(joinedAt)}
              </span>
            </div>
          </div>
        </div>

        {slug && (
          <ProfileShareDialog
            slug={slug}
            className="shrink-0 self-start"
            card={{
              displayName,
              handle,
              maturityLabel,
              displayLevel,
              displayMaxLevel,
              memoriesCount,
              cloneMatchPercent,
            }}
          />
        )}
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ProfileStat
          label="Clone match"
          value={`${cloneMatchPercent}%`}
          icon={Target}
          accent="yellow"
          hint="Fan vs clone picks"
        />
        <ProfileStat
          label="Memories"
          value={memoriesCount}
          icon={Shield}
          accent="green"
          hint="Stored receipts"
        />
        <ProfileStat
          label="Predictions"
          value={predictionsCount}
          icon={TrendingUp}
          accent="emerald"
          hint="Matches locked"
        />
        <ProfileStat
          label="Walrus"
          value={walrusBackedCount}
          icon={Database}
          accent="green"
          hint="Verified on-chain"
        />
      </div>
    </header>
  );
}

function ProfileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-hoolclone-green-900 text-white shadow-sm"
          : "bg-white text-hoolclone-green-900 ring-1 ring-border/60 hover:bg-hoolclone-green-50",
      )}
    >
      {children}
    </Link>
  );
}

function ProfileStat({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Target;
  accent: "green" | "yellow" | "emerald";
  hint?: string;
}) {
  const styles = {
    green: "border-hoolclone-green-200/70 bg-white/80",
    yellow: "border-amber-200/70 bg-white/80",
    emerald: "border-emerald-200/70 bg-white/80",
  }[accent];

  const iconColor = {
    green: "text-hoolclone-green-700",
    yellow: "text-amber-700",
    emerald: "text-emerald-700",
  }[accent];

  return (
    <div className={cn("rounded-xl border p-3", styles)}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-hoolclone-green-950">
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
