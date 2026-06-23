import { cn } from "@/lib/utils";

type EvolutionSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "highlight";
};

export function EvolutionSection({
  eyebrow,
  title,
  description,
  children,
  className,
  variant = "default",
}: EvolutionSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        variant === "subtle" && "border-hoolclone-green-100/80 bg-hoolclone-green-50/20 shadow-none",
        variant === "highlight" &&
          "border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50/80 via-white to-hoolclone-yellow-50/30 shadow-sm",
        variant === "default" && "border-border/50 bg-white shadow-sm",
        className,
      )}
    >
      <div className="mb-5 border-b border-border/40 pb-4">
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
      {children}
    </section>
  );
}
