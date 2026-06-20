import { Calendar, Globe, Share, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { formatDate } from "@/lib/mock/demo-user";
import type { CloneMaturity } from "@/lib/mock/types";

export type ProfileHeaderProps = {
  displayName: string;
  handle: string;
  bio: string;
  joinedAt: string;
  maturityLabel: CloneMaturity;
  level: number;
};

export function ProfileHeader({
  displayName,
  handle,
  bio,
  joinedAt,
  maturityLabel,
  level,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CloneAvatar size="lg" />
        <div className="space-y-2">
          <h1 className="text-xl font-bold">
            @{handle} · {displayName}&apos;s HoolClone
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-hoolclone-green-100 px-3 py-1 text-xs font-semibold text-hoolclone-green-900">
              <Shield className="h-3.5 w-3.5" />
              {maturityLabel} · Level {level}
            </span>
            <MaturityBadge maturity={maturityLabel} />
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">{bio}</p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              Public Clone Profile
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {formatDate(joinedAt)}
            </span>
          </div>
        </div>
      </div>

      <Button variant="accent" className="shrink-0">
        <Share className="mr-2 h-4 w-4" />
        Share Clone
      </Button>
    </div>
  );
}
