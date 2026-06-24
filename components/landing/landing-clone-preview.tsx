import { Brain, Fingerprint, Target } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type LandingClonePreviewProps = {
  className?: string;
};

export function LandingClonePreview({ className }: LandingClonePreviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_24px_60px_rgba(10,61,46,0.14),0_8px_24px_rgba(10,61,46,0.08)]",
        className,
      )}
    >
      <div className="bg-hoolclone-green-900 px-4 py-3 text-white">
        <p className="text-[10px] font-bold tracking-widest text-white/70">
          CLONE MATURITY
        </p>
        <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90">
          Illustrative preview
        </span>
        <div className="mt-1 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold">Contradiction Hunter</p>
            <p className="text-xs text-white/70">Level 3 of 5</p>
          </div>
          <span className="text-sm font-bold">68%</span>
        </div>
        <Progress
          value={68}
          className="mt-2 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-white/20 [&_[data-slot=progress-indicator]]:bg-hoolclone-yellow-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-border/60 p-3">
        <Stat icon={Brain} value="41" label="Memories" />
        <Stat icon={Fingerprint} value="74%" label="Matches You" />
        <Stat icon={Target} value="44%" label="Accuracy" />
      </div>

      <div className="space-y-3 p-4">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">
          NEXT MATCH
        </p>
        <p className="text-[11px] font-semibold text-hoolclone-green-900">
          Quarter-Final · Jul 9, 2026
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flags/por.svg"
              alt="Portugal"
              className="h-8 w-11 rounded-sm object-cover shadow-sm"
            />
            <span className="text-xs font-semibold">Portugal</span>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-hoolclone-green-900">VS</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flags/fra.svg"
              alt="France"
              className="h-8 w-11 rounded-sm object-cover shadow-sm"
            />
            <span className="text-xs font-semibold">France</span>
          </div>
        </div>
        <ButtonLink href="/predict" variant="accent" className="w-full">
          Predict Match
        </ButtonLink>
        <div className="flex items-center gap-2 border-t border-border/60 pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/walrus.svg"
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            aria-hidden
          />
          <p className="text-xs text-muted-foreground">
            Your clone already has a take.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-4 w-4 text-hoolclone-green-700" />
      <p className="mt-1 text-sm font-bold leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
