import { cn } from "@/lib/utils";
import type { Team } from "@/lib/mock/types";

const sizeClasses = {
  sm: "h-5 w-7",
  md: "h-8 w-11",
  lg: "h-12 w-16",
  xl: "h-16 w-24",
};

type TeamFlagProps = {
  team: Team;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function TeamFlag({ team, size = "md", className }: TeamFlagProps) {
  if (team.flag.startsWith("/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.flag}
        alt={`${team.name} flag`}
        className={cn(
          "inline-block rounded-sm object-cover shadow-sm ring-1 ring-black/5",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <span className={cn("inline-block leading-none", className)} aria-hidden>
      {team.flag}
    </span>
  );
}
