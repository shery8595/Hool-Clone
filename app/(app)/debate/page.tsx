"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MaturityBadge } from "@/components/clone/clone-avatar";
import { ChatMessage } from "@/components/debate/chat-message";
import { ChatInput } from "@/components/debate/chat-input";
import { ReceiptDrawer } from "@/components/debate/receipt-drawer";
import {
  fetchDebateOpening,
  fetchMemories,
  saveDebateHighlight,
  sendDebateMessage,
} from "@/lib/api/client";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";
import { useUser } from "@/components/providers/user-provider";

function buildOpeningMessage(text: string): DebateMessage {
  const now = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return {
    id: "opening",
    role: "clone",
    text:
      text.trim() ||
      "Challenge me on any football take. I will argue from what I remember about you.",
    timestamp: now,
  };
}

export default function DebatePage() {
  const { me } = useUser();
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [memories, setMemories] = useState<MemoryReceipt[]>([]);
  const [sending, setSending] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusReceiptId, setFocusReceiptId] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState(0);
  const variantRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const highlightedReceiptIds = useMemo(() => {
    const ids = new Set<string>();
    for (const message of messages) {
      if (message.role !== "clone") continue;
      for (const receipt of message.citedReceipts ?? []) {
        ids.add(receipt.id);
      }
    }
    return [...ids];
  }, [messages]);

  const loadMemories = useCallback(async () => {
    if (!me) return;
    try {
      const data = await fetchMemories();
      setMemories(data.memories);
    } catch {
      setMemories([]);
    }
  }, [me]);

  const loadOpening = useCallback(
    async (variantIndex?: number) => {
      if (!me) return;
      setStartingChat(true);
      setError(null);
      setFocusReceiptId(null);

      try {
        const opening = await fetchDebateOpening({ variantIndex });
        setMessages([opening]);
        setChatSession((n) => n + 1);
      } catch {
        setMessages([
          buildOpeningMessage(
            me.profile.summary ??
              "Challenge me on any football take. I will argue from what I remember about you.",
          ),
        ]);
        setChatSession((n) => n + 1);
      } finally {
        setStartingChat(false);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
    },
    [me],
  );

  useEffect(() => {
    if (!me) return;
    void loadOpening(0);
    void loadMemories();
  }, [me, loadOpening, loadMemories]);

  const handleNewChat = () => {
    if (sending || startingChat) return;

    const previousMessages = messages;
    variantRef.current += 1;
    void (async () => {
      if (previousMessages.length > 1) {
        try {
          await saveDebateHighlight({ messages: previousMessages });
          await loadMemories();
        } catch {
          // Non-blocking — new chat still starts if highlight save fails.
        }
      }
      await loadOpening(variantRef.current);
      if (previousMessages.length <= 1) {
        await loadMemories();
      }
    })();
  };

  const handleSend = async (text: string) => {
    if (!me) {
      setError("Connect your wallet to debate your clone.");
      return;
    }

    const now = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const userMessage: DebateMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: now,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setSending(true);
    setError(null);

    try {
      const reply = await sendDebateMessage({
        message: text,
        recentMessages: nextMessages,
      });
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get clone reply");
    } finally {
      setSending(false);
    }
  };

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-12 text-center">
        <p className="text-muted-foreground">
          Connect your wallet to debate your clone with live memories.
        </p>
      </div>
    );
  }

  const tagline =
    me.profile.memoriesCount > 0
      ? `${me.profile.memoriesCount} memories fuel this debate`
      : "Train your clone first for sharper arguments";

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-7xl flex-col gap-4 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-hoolclone-green-700" />
              <h1 className="font-bold">Debate your clone</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={sending || startingChat}
                onClick={handleNewChat}
                className="hidden sm:inline-flex"
              >
                <Plus className="mr-2 h-4 w-4" />
                New chat
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={sending || startingChat}
                onClick={handleNewChat}
                className="sm:hidden"
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-xs text-muted-foreground">Clone maturity:</span>
                <MaturityBadge maturity={me.profile.cloneMaturityLabel} />
              </div>
            </div>
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="lg:hidden" />
                }
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Receipts
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0 sm:max-w-md">
                <ReceiptDrawer
                  memories={memories}
                  highlightedIds={highlightedReceiptIds}
                  scrollToId={focusReceiptId}
                  showClose
                  onRefresh={() => void loadMemories()}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="border-b border-border px-4 py-3">
          <p className="font-semibold">Your HoolClone</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <MaturityBadge maturity={me.profile.cloneMaturityLabel} />
            <span className="text-sm text-muted-foreground">{tagline}</span>
          </div>
        </div>

        <div
          ref={scrollRef}
          key={chatSession}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {startingChat && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Starting a new debate...</p>
          )}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onReceiptClick={(receiptId) => setFocusReceiptId(receiptId)}
            />
          ))}
          {sending && (
            <p className="text-sm text-muted-foreground">Clone is thinking...</p>
          )}
        </div>

        <div className="border-t border-border p-4">
          <ChatInput
            onSend={(text) => void handleSend(text)}
            disabled={sending || startingChat}
          />
          {error && <p className="mt-2 text-center text-xs text-destructive">{error}</p>}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Healthy debate makes a sharper clone. Corrections store to Walrus memory.
          </p>
        </div>
      </div>

      <div className="hidden w-80 shrink-0 lg:block xl:w-96">
        <ReceiptDrawer
          memories={memories}
          highlightedIds={highlightedReceiptIds}
          scrollToId={focusReceiptId}
          onRefresh={() => void loadMemories()}
        />
      </div>
    </div>
  );
}
