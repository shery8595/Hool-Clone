import { cn } from "@/lib/utils";

type ProfileSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "highlight";
  action?: React.ReactNode;
};

export function ProfileSection({
  eyebrow,
  title,
  description,
  children,
  className,
  variant = "default",
  action,
}: ProfileSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border",
        variant === "subtle" &&
          "border-hoolclone-green-100/80 bg-hoolclone-green-50/20 shadow-none",
        variant === "highlight" &&
          "border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50/80 via-white to-hoolclone-yellow-50/30 shadow-sm",
        variant === "default" && "border-border/50 bg-white shadow-sm",
        className,
      )}
    >
      {variant === "highlight" && (
        <div
          className="h-1 bg-gradient-to-r from-hoolclone-green-600 via-hoolclone-yellow-500 to-hoolclone-green-400"
          aria-hidden
        />
      )}

      <div className="p-5 sm:p-6">
        <div
          className={cn(
            "mb-5 flex flex-wrap items-end justify-between gap-3",
            variant !== "subtle" && "border-b border-border/40 pb-4",
          )}
        >
          <div>
            {eyebrow && (
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-hoolclone-green-800">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-hoolclone-green-950">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
