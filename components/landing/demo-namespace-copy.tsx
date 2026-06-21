"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type DemoNamespaceCopyProps = {
  value: string;
  className?: string;
};

export function DemoNamespaceCopy({ value, className }: DemoNamespaceCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-xl border border-hoolclone-green-100 bg-hoolclone-gray-50 px-4 py-3 text-left transition-colors hover:border-hoolclone-green-200 hover:bg-white",
        className,
      )}
      aria-label="Copy demo namespace"
    >
      <code className="min-w-0 flex-1 truncate font-mono text-sm text-hoolclone-green-900">
        {value}
      </code>
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-hoolclone-green-700">
        <Copy className="h-3.5 w-3.5" />
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
