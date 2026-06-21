"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Database, ExternalLink } from "lucide-react";
import { RecallSourceBadge } from "@/components/memory/recall-source-badge";
import { cn } from "@/lib/utils";
import type { RecallSource } from "@/lib/mock/types";

export type TelegramCitedMemory = {
  id?: string;
  text: string;
  type?: string;
  source?: string;
  walrusBlobId?: string;
  recallSource?: RecallSource;
};

export function TelegramMemoryReceipts({
  citedMemories,
  recallSource,
}: {
  citedMemories: TelegramCitedMemory[];
  recallSource?: RecallSource;
}) {
  const [open, setOpen] = useState(false);

  if (citedMemories.length === 0) return null;

  return (
    <div className="mt-4 border-t border-hoolclone-green-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold text-hoolclone-green-800"
      >
        <span>Memory receipts used ({citedMemories.length})</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {recallSource && (
        <div className="mt-2">
          <RecallSourceBadge source={recallSource} />
        </div>
      )}

      {open && (
        <ul className="mt-3 space-y-2">
          {citedMemories.map((memory, index) => (
            <li
              key={memory.id ?? `${index}-${memory.text.slice(0, 24)}`}
              className="rounded-xl bg-hoolclone-green-50/70 px-3 py-2 text-xs"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold uppercase tracking-wide text-hoolclone-green-800">
                  {memory.source ?? memory.type ?? "memory"}
                </span>
                {memory.walrusBlobId && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Database className="h-3 w-3" />
                    Walrus blob
                  </span>
                )}
              </div>
              <p className="leading-relaxed text-foreground">{memory.text}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {memory.id && (
                  <Link
                    href="/memory"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-hoolclone-green-700 hover:underline"
                  >
                    View in Memory
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {memory.walrusBlobId && (
                  <Link
                    href={`/api/walrus/blobs/${encodeURIComponent(memory.walrusBlobId)}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-hoolclone-green-700 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Walrus proof
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
