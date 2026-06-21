import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DocPage } from "@/lib/docs/navigation";

export function DocsPager({
  prev,
  next,
}: {
  prev: DocPage | null;
  next: DocPage | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/50"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="font-semibold text-hoolclone-gray-900">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/50 sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Next
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="font-semibold text-hoolclone-gray-900">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
