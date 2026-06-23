"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debateQuickActions } from "@/lib/mock/debate-messages";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 rounded-2xl border border-hoolclone-green-200/70 bg-white p-2 shadow-sm ring-1 ring-hoolclone-green-100/50">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Push back on your clone..."
          rows={2}
          disabled={disabled}
          className="max-h-28 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
          aria-label="Reply to your clone"
        />
        <Button
          size="sm"
          className="mb-0.5 shrink-0 rounded-xl"
          disabled={!value.trim() || disabled}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Send</span>
        </Button>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Quick openers
        </p>
        <div className="flex flex-wrap gap-2">
          {debateQuickActions.map(({ id, label, prompt }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => setValue(prompt)}
              className={cn(
                "rounded-full border border-border/70 bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 transition",
                "hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50 disabled:opacity-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
