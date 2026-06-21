import { Trophy } from "lucide-react";
import { flagPath, wc2026Teams } from "@/lib/mock/wc2026-teams";
import { cn } from "@/lib/utils";

const rowOneTeams = wc2026Teams.slice(0, 24);
const rowTwoTeams = wc2026Teams.slice(24, 48);

function FlagItem({ code, name, large }: { code: string; name: string; large?: boolean }) {
  return (
    <div
      className={cn(
        "group flex shrink-0 flex-col items-center",
        large ? "gap-2.5 px-3" : "gap-2 px-2",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagPath(code)}
        alt={`${name} flag`}
        className={cn(
          "rounded-md object-cover shadow-md ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105",
          large ? "h-[4.03rem] w-[5.18rem] sm:h-[4.6rem] sm:w-[6.9rem]" : "h-[3.16rem] w-[4.6rem]",
        )}
        draggable={false}
        loading="lazy"
      />
      <span
        className={cn(
          "max-w-[5.5rem] truncate font-bold uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-hoolclone-green-900",
          large ? "text-xs" : "text-[10px]",
        )}
      >
        {code}
      </span>
    </div>
  );
}

function MarqueeRow({
  teams,
  direction,
  className,
}: {
  teams: typeof wc2026Teams;
  direction: "left" | "right";
  className?: string;
}) {
  const loop = [...teams, ...teams];

  return (
    <div className={cn("flags-marquee-mask relative overflow-hidden", className)}>
      <div
        className={cn(
          "flags-marquee-row flex w-max items-center gap-6 sm:gap-10",
          direction === "left" ? "flags-marquee-row--left" : "flags-marquee-row--right",
        )}
      >
        {loop.map((team, index) => (
          <FlagItem
            key={`${team.code}-${index}`}
            code={team.code}
            name={team.name}
            large
          />
        ))}
      </div>
    </div>
  );
}

export function LandingFlagsMarquee() {
  return (
    <section
      id="wc-nations"
      aria-labelledby="wc-nations-heading"
      className="relative overflow-hidden border-y border-hoolclone-green-100 bg-gradient-to-b from-white via-hoolclone-green-100/25 to-white py-14 lg:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(26,107,74,0.12), transparent 45%), radial-gradient(circle at 80% 50%, rgba(245,197,24,0.1), transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hoolclone-green-100 bg-white px-4 py-1.5 shadow-sm">
            <Trophy className="h-4 w-4 text-hoolclone-yellow-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-hoolclone-green-900">
              USA · Canada · Mexico
            </span>
          </div>
          <h2
            id="wc-nations-heading"
            className="text-2xl font-black uppercase tracking-tight text-hoolclone-gray-900 sm:text-3xl lg:text-4xl"
          >
            48 Nations.{" "}
            <span className="text-hoolclone-green-700">One World Cup.</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Every flag. Every fan. Train your clone for the teams you love — and
            the ones you love to hate.
          </p>
        </div>

        <div className="flags-marquee-animated mt-12 space-y-6 lg:mt-14 lg:space-y-8">
          <MarqueeRow teams={rowOneTeams} direction="left" />
          <MarqueeRow teams={rowTwoTeams} direction="right" />
        </div>

        <div className="flags-marquee-static mt-12 hidden flex-wrap justify-center gap-x-8 gap-y-6">
          {wc2026Teams.map((team) => (
            <FlagItem key={team.code} code={team.code} name={team.name} large />
          ))}
        </div>
      </div>
    </section>
  );
}
