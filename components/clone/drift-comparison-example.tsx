import { cn } from "@/lib/utils";
import { TextWithTeamFlags } from "@/components/match/team-label-with-flags";

type DriftComparisonExampleProps = {
  userPick: string;
  clonePick: string;
  difference: "large" | "small";
  className?: string;
};

export function DriftComparisonExample({
  userPick,
  clonePick,
  difference,
  className,
}: DriftComparisonExampleProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm",
        difference === "large"
          ? "border-amber-200 bg-amber-50/60"
          : "border-hoolclone-green-200 bg-hoolclone-green-50/60",
        className,
      )}
    >
      <p>
        <span className="font-semibold">You predicted:</span>{" "}
        <TextWithTeamFlags text={userPick} size="sm" />
      </p>
      <p className="mt-1">
        <span className="font-semibold">Clone predicted:</span>{" "}
        <TextWithTeamFlags text={clonePick} size="sm" />
      </p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Difference:{" "}
        <span
          className={
            difference === "large"
              ? "text-amber-700"
              : "text-hoolclone-green-700"
          }
        >
          {difference === "large" ? "Large" : "Small"}
        </span>
      </p>
    </div>
  );
}
