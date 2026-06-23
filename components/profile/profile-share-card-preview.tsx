import {
  SHARE_CARD_BG_SRC,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from "@/lib/profile/share-card";
import type { ShareCardData } from "@/lib/profile/share-card";
import { cn } from "@/lib/utils";

type ProfileShareCardPreviewProps = {
  data: ShareCardData;
  className?: string;
};

export function ProfileShareCardPreview({
  data,
  className,
}: ProfileShareCardPreviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hoolclone-green-200/70 shadow-[0_20px_60px_-24px_rgba(10,61,46,0.35)]",
        className,
      )}
      style={{ aspectRatio: `${SHARE_CARD_WIDTH} / ${SHARE_CARD_HEIGHT}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SHARE_CARD_BG_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 p-[6%] pr-[34%]">
        <div className="space-y-2 sm:space-y-3">
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-hoolclone-green-700 sm:text-[10px]">
            Public clone profile
          </p>
          <h3 className="text-lg font-extrabold leading-tight tracking-tight text-hoolclone-green-900 sm:text-2xl md:text-3xl">
            {data.displayName}&apos;s HoolClone
          </h3>
          <p className="text-sm font-semibold text-hoolclone-green-800 sm:text-base">
            @{data.handle}
          </p>
          <p className="text-[11px] text-muted-foreground sm:text-sm">
            Walrus-backed · Judge-ready insights
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4 sm:gap-2.5 sm:pt-2">
            <ShareStat label="Clone match" value={`${data.cloneMatchPercent}%`} />
            <ShareStat label="Memories" value={String(data.memoriesCount)} />
            <ShareStat
              label="Level"
              value={`${data.displayLevel}/${data.displayMaxLevel}`}
            />
          </div>

          <span className="inline-flex rounded-full bg-hoolclone-green-100/90 px-3 py-1 text-[10px] font-bold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200 sm:text-xs">
            {data.maturityLabel} · Level {data.displayLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

function ShareStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hoolclone-green-200/70 bg-white/90 px-2.5 py-2 sm:px-3 sm:py-2.5">
      <p className="text-[8px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[10px]">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-hoolclone-green-950 sm:text-xl">
        {value}
      </p>
    </div>
  );
}
