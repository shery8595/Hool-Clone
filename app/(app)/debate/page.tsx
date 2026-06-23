"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatMessage } from "@/components/debate/chat-message";
import { ChatInput } from "@/components/debate/chat-input";
import { DebatePageHeader } from "@/components/debate/debate-page-header";
import { DebateTypingIndicator } from "@/components/debate/debate-typing-indicator";
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

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

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
      <div className="mx-auto max-w-lg rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-hoolclone-green-950">
          Debate your clone
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your wallet to argue with receipts from your Walrus memories.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <DebatePageHeader
        displayName={me.displayName}
        namespace={me.memwalNamespace}
        maturityLabel={me.profile.cloneMaturityLabel}
        memoriesCount={me.profile.memoriesCount}
        citedReceiptCount={highlightedReceiptIds.length}
        turnCount={messages.length}
      />

      <div className="flex min-h-[calc(100vh-14rem)] flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-hoolclone-green-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live debate
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={sending || startingChat}
                onClick={handleNewChat}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New chat</span>
              </Button>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl lg:hidden"
                    />
                  }
                >
                  <Receipt className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">Receipts</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-full p-0 sm:max-w-md">
                  <ReceiptDrawer
                    memories={memories}
                    highlightedIds={highlightedReceiptIds}
                    scrollToId={focusReceiptId}
                    onRefresh={() => void loadMemories()}
                    className="h-full rounded-none border-0 shadow-none"
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div
            ref={scrollRef}
            key={chatSession}
            className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-hoolclone-green-50/25 via-white to-white p-4 sm:p-5"
          >
            {startingChat && messages.length === 0 && (
              <div className="py-12">
                <DebateTypingIndicator />
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onReceiptClick={(receiptId) => setFocusReceiptId(receiptId)}
              />
            ))}
            {sending && <DebateTypingIndicator />}
          </div>

          <div className="border-t border-border bg-white p-4 sm:p-5">
            <ChatInput
              onSend={(text) => void handleSend(text)}
              disabled={sending || startingChat}
            />
            {error && (
              <p className="mt-2 text-center text-xs text-destructive">{error}</p>
            )}
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Healthy debate makes a sharper clone. Corrections store to Walrus
              memory.
            </p>
          </div>
        </div>

        <div className="hidden w-80 shrink-0 lg:block xl:w-96">
          <ReceiptDrawer
            memories={memories}
            highlightedIds={highlightedReceiptIds}
            scrollToId={focusReceiptId}
            onRefresh={() => void loadMemories()}
            className="sticky top-4 h-[calc(100vh-14rem)]"
          />
        </div>
      </div>
    </div>
  );
}
