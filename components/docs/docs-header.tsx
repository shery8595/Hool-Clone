"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { docSections } from "@/lib/docs/navigation";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { cn } from "@/lib/utils";

type SearchItem = {
  title: string;
  href: string;
  section: string;
  description?: string;
};

export function DocsSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const items = useMemo<SearchItem[]>(
    () =>
      docSections.flatMap((section) =>
        section.pages.map((page) => ({
          title: page.title,
          href: `/docs/${page.slug}`,
          section: section.title,
          description: page.description,
        })),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [items, query]);

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [onOpenChange, router],
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-[12vh] backdrop-blur-[1px]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No pages found.
            </li>
          ) : (
            filtered.map((item) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/60"
                >
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.section}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export function DocsHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center">
            <HoolCloneLogo
              size="sm"
              showWordmark
              showTagline={false}
              wordmarkVariant="light"
            />
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              "mx-auto hidden h-9 w-full max-w-md items-center gap-2 rounded-full border border-border bg-muted/30 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted/50 md:flex",
            )}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="font-mono text-[10px] text-muted-foreground/80">
              Ctrl K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              App
            </Link>
            <Link
              href="/api/memories/health"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              Status
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-full bg-hoolclone-green-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-hoolclone-green-900"
            >
              Open app
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground md:hidden"
              aria-label="Search docs"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="hidden border-t border-border px-6 lg:block">
          <p className="inline-flex border-b-2 border-hoolclone-green-700 py-2.5 text-sm font-medium text-foreground">
            Documentation
          </p>
        </div>
      </header>

      <DocsSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
