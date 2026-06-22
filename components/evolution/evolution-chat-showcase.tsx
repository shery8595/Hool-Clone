"use client";

import { useCallback, useRef, useState } from "react";
import { MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import { ChatMessage } from "@/components/debate/chat-message";
import { ChatInput } from "@/components/debate/chat-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sendEvolutionChatMessage } from "@/lib/api/client";
import { buildEvolutionPhaseReply } from "@/lib/evolution/build-evolution-chat";
import {
  EVOLUTION_COMPARE_PRESETS,
  EVOLUTION_PHASE_OPTIONS,
  memoriesForEvolutionPhase,
} from "@/lib/evolution/evolution-phase-memories";
import { defaultEvolutionChatQuestion } from "@/lib/evolution/evolution-chat-question";
import type { TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";
import { useUser } from "@/components/providers/user-provider";
import { cn } from "@/lib/utils";

type EvolutionChatShowcaseProps = {
  allMemoryReceipts: MemoryReceipt[];
  memoryTimeMachine: MemoryTimeMachine | null;
  className?: string;
};

type PaneState = {
  phaseId: TimeMachinePhaseId;
  messages: DebateMessage[];
  sending: boolean;
};

function nowTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function userMessage(text: string): DebateMessage {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "user",
    text,
    timestamp: nowTimestamp(),
  };
}

function cloneMessage(
  text: string,
  citedReceipts: MemoryReceipt[] = [],
): DebateMessage {
  return {
    id: `clone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "clone",
    text,
    citedReceipts,
    timestamp: nowTimestamp(),
  };
}

export function EvolutionChatShowcase({
  allMemoryReceipts,
  memoryTimeMachine,
  className,
}: EvolutionChatShowcaseProps) {
  const { me } = useUser();
  const [leftPane, setLeftPane] = useState<PaneState>({
    phaseId: "day1",
    messages: [],
    sending: false,
  });
  const [rightPane, setRightPane] = useState<PaneState>({
    phaseId: "day7",
    messages: [],
    sending: false,
  });

  const generateReply = useCallback(
    async (
      phaseId: TimeMachinePhaseId,
      message: string,
      recentMessages: DebateMessage[],
    ) => {
      if (me?.id) {
        try {
          const result = await sendEvolutionChatMessage({
            phaseId,
            message,
            recentMessages,
          });
          return result.reply;
        } catch {
          // Fall back to local phase replay when API is unavailable.
        }
      }

      const built = buildEvolutionPhaseReply({
        phaseId,
        userMessage: message,
        recentMessages,
        allMemoryReceipts,
        memoryTimeMachine,
      });
      return cloneMessage(built.reply, built.citedReceipts);
    },
    [allMemoryReceipts, memoryTimeMachine, me],
  );

  const sendToPane = useCallback(
    async (side: "left" | "right", text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const setPane = side === "left" ? setLeftPane : setRightPane;
      const pane = side === "left" ? leftPane : rightPane;
      if (pane.sending) return;

      const outgoing = userMessage(trimmed);
      const thread = [...pane.messages, outgoing];

      setPane((current) => ({
        ...current,
        messages: thread,
        sending: true,
      }));

      try {
        const incoming = await generateReply(
          pane.phaseId,
          trimmed,
          thread,
        );
        setPane((current) => ({
          ...current,
          messages: [...current.messages, incoming],
          sending: false,
        }));
      } catch {
        setPane((current) => ({ ...current, sending: false }));
      }
    },
    [generateReply, leftPane, rightPane],
  );

  function applyPreset(left: TimeMachinePhaseId, right: TimeMachinePhaseId) {
    setLeftPane({ phaseId: left, messages: [], sending: false });
    setRightPane({ phaseId: right, messages: [], sending: false });
  }

  function seedBothWithStarter() {
    const starter = defaultEvolutionChatQuestion(memoryTimeMachine);
    void sendToPane("left", starter);
    void sendToPane("right", starter);
  }

  return (
    <Card className={cn("rounded-2xl border-0 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-5 w-5 text-hoolclone-yellow-600" />
          Evolution chat — compare clone days side by side
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Two independent chats. Pick the day for each side; Day 7 recalls your
          full memory library. Type in either column — replies use only memories
          available on that day.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {EVOLUTION_COMPARE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => applyPreset(preset.left, preset.right)}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="text-xs"
            onClick={seedBothWithStarter}
            disabled={leftPane.sending || rightPane.sending}
          >
            Ask starter question on both
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <EvolutionChatPane
            pane={leftPane}
            allMemoryReceipts={allMemoryReceipts}
            onPhaseChange={(phaseId) =>
              setLeftPane({ phaseId, messages: [], sending: false })
            }
            onSend={(text) => void sendToPane("left", text)}
            onClear={() =>
              setLeftPane((current) => ({ ...current, messages: [] }))
            }
            accent="muted"
          />
          <EvolutionChatPane
            pane={rightPane}
            allMemoryReceipts={allMemoryReceipts}
            onPhaseChange={(phaseId) =>
              setRightPane({ phaseId, messages: [], sending: false })
            }
            onSend={(text) => void sendToPane("right", text)}
            onClear={() =>
              setRightPane((current) => ({ ...current, messages: [] }))
            }
            accent="highlight"
          />
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-muted/35 px-3 py-2.5 text-xs leading-relaxed text-hoolclone-gray-900">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hoolclone-yellow-600" />
          <span>
            <strong className="font-semibold">Judge note:</strong> Day 1 uses
            zero memories; Day 7 uses every stored receipt. Middle days replay
            the chronological slice from the time machine.
            {me ? " Logged in — Gemini debate when configured." : ""}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

function EvolutionChatPane({
  pane,
  allMemoryReceipts,
  onPhaseChange,
  onSend,
  onClear,
  accent,
}: {
  pane: PaneState;
  allMemoryReceipts: MemoryReceipt[];
  onPhaseChange: (phaseId: TimeMachinePhaseId) => void;
  onSend: (text: string) => void;
  onClear: () => void;
  accent: "muted" | "highlight";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const phaseMemories = memoriesForEvolutionPhase(
    pane.phaseId,
    allMemoryReceipts,
  );

  return (
    <div
      className={cn(
        "flex min-h-[28rem] flex-col rounded-xl border",
        accent === "highlight"
          ? "border-hoolclone-yellow-300 bg-gradient-to-b from-hoolclone-yellow-50/40 to-white"
          : "border-dashed border-muted-foreground/30 bg-muted/10",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          Clone day
          <select
            value={pane.phaseId}
            onChange={(event) =>
              onPhaseChange(event.target.value as TimeMachinePhaseId)
            }
            className="rounded-lg border border-border/60 bg-white px-2 py-1 text-xs font-semibold text-hoolclone-green-950"
          >
            {EVOLUTION_PHASE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border/60">
            {phaseMemories.length} mem available
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[10px]"
            onClick={onClear}
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-3 py-4"
      >
        {pane.messages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 bg-white/70 px-3 py-6 text-center text-xs text-muted-foreground">
            No messages yet — type below to debate this day&apos;s clone.
          </p>
        ) : (
          pane.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {pane.sending && (
          <p className="text-center text-xs text-muted-foreground">
            Clone is thinking with Day {pane.phaseId.replace("day", "")}{" "}
            memories…
          </p>
        )}
      </div>

      <div className="border-t border-border/40 p-3">
        <ChatInput onSend={onSend} disabled={pane.sending} />
      </div>
    </div>
  );
}
