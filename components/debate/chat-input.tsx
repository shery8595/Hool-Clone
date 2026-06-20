"use client";

import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debateQuickActions } from "@/lib/mock/debate-messages";

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
      <div className="flex items-center gap-2 rounded-xl border border-input bg-white px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Reply to your clone..."
          className="flex-1 bg-transparent text-sm outline-none"
          aria-label="Reply to your clone"
        />
        <Button variant="ghost" size="icon" className="shrink-0">
          <Smile className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          size="sm"
          disabled={!value.trim() || disabled}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {debateQuickActions.map(({ id, label, prompt }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setValue(prompt)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
