import { BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileAnalyticsAccordionProps = {
  children: React.ReactNode;
  className?: string;
};

export function ProfileAnalyticsAccordion({
  children,
  className,
}: ProfileAnalyticsAccordionProps) {
  return (
    <details
      className={cn(
        "group overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-hoolclone-green-50/30 sm:px-6 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-hoolclone-green-200/70 bg-hoolclone-green-50 text-hoolclone-green-800">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-hoolclone-green-950">
              Deeper analytics
            </p>
            <p className="text-xs text-muted-foreground">
              Drift, consistency, bias radar, and season report
            </p>
          </div>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-6 border-t border-border/40 p-5 sm:p-6">{children}</div>
    </details>
  );
}
