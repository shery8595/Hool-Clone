"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type DocsCopyPageButtonProps = {
  /** Markdown source to copy. Falls back to current page URL. */
  markdown?: string;
};

export function DocsCopyPageButton({ markdown }: DocsCopyPageButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text =
      markdown ??
      (typeof window !== "undefined" ? window.location.href : "");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [markdown]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2 rounded-full"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-hoolclone-green-700" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy page
        </>
      )}
    </Button>
  );
}
