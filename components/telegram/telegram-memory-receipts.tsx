"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Database, ExternalLink } from "lucide-react";
import { RecallSourceBadge } from "@/components/memory/recall-source-badge";
import { cn } from "@/lib/utils";
import type { CitationSource } from "@/lib/telegram/citation-enforcement";
import type { MessageRecallBackend } from "@/lib/telegram/message-recall-backend";
import type { RecalledMemorySnapshot } from "@/lib/telegram/recalled-memory-snapshot";

export type TelegramCitedMemory = {
  id?: string;
  text: string;
  type?: string;
  source?: string;
  walrusBlobId?: string;
  recallSource?: "walrus" | "postgres_fallback";
  citationSource?: CitationSource;
};

function MemoryListItem({
  memory,
  index,
  badge,
}: {
  memory: TelegramCitedMemory | RecalledMemorySnapshot;
  index: number;
  badge?: string;
}) {
  const text = "textExcerpt" in memory ? memory.textExcerpt : memory.text;
  const id = memory.id;

  return (
    <li
      key={id ?? `${index}-${text.slice(0, 24)}`}
      className="rounded-xl bg-hoolclone-green-50/70 px-3 py-2 text-xs"
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        {badge && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hoolclone-green-800">
            {badge}
          </span>
        )}
        <span className="font-semibold uppercase tracking-wide text-hoolclone-green-800">
          {memory.source ?? memory.type ?? "memory"}
        </span>
        {memory.walrusBlobId && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Database className="h-3 w-3" />
            Walrus blob
          </span>
        )}
        {"citationSource" in memory && memory.citationSource && (
          <span className="text-[10px] text-muted-foreground">
            {memory.citationSource === "enforced" ? "Enforced" : "LLM cited"}
          </span>
        )}
      </div>
      <p className="leading-relaxed text-foreground">{text}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {id && (
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
  );
}

export function TelegramMemoryReceipts({
  citedMemories,
  recalledMemories = [],
  recallSource,
  citationSource,
  citationWarnings = [],
}: {
  citedMemories: TelegramCitedMemory[];
  recalledMemories?: RecalledMemorySnapshot[];
  recallSource?: MessageRecallBackend;
  citationSource?: CitationSource;
  citationWarnings?: string[];
}) {
  const [openRecalled, setOpenRecalled] = useState(false);
  const [openCited, setOpenCited] = useState(false);

  if (citedMemories.length === 0 && recalledMemories.length === 0) return null;

  return (
    <div className="mt-4 space-y-3 border-t border-hoolclone-green-100 pt-3">
      {recallSource && (
        <div>
          <RecallSourceBadge source={recallSource} />
        </div>
      )}

      {citationSource && (
        <p className="text-[11px] text-muted-foreground">
          Citations:{" "}
          {citationSource === "enforced"
            ? "system-enforced from recalled memories"
            : "chosen by the clone LLM"}
        </p>
      )}

      {citationWarnings.length > 0 && (
        <ul className="space-y-1 text-[11px] text-amber-800">
          {citationWarnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}

      {recalledMemories.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOpenRecalled((v) => !v)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-hoolclone-green-800"
          >
            <span>Recalled memories ({recalledMemories.length})</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", openRecalled && "rotate-180")}
            />
          </button>
          {openRecalled && (
            <ul className="mt-3 space-y-2">
              {recalledMemories.map((memory, index) => (
                <MemoryListItem
                  key={memory.id ?? `recalled-${index}`}
                  memory={memory}
                  index={index}
                  badge="Recalled"
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {citedMemories.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOpenCited((v) => !v)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-hoolclone-green-800"
          >
            <span>Used in message ({citedMemories.length})</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", openCited && "rotate-180")}
            />
          </button>
          {openCited && (
            <ul className="mt-3 space-y-2">
              {citedMemories.map((memory, index) => (
                <MemoryListItem
                  key={memory.id ?? `cited-${index}`}
                  memory={memory}
                  index={index}
                  badge="Cited"
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
