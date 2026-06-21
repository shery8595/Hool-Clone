import type { TelegramMessageAssembly } from "@/lib/telegram/assemble-telegram-message";

/** Map assembly output to send-and-store payload fields. */
export function assemblyToStoreFields(assembly: TelegramMessageAssembly) {
  return {
    body: assembly.message,
    citedMemoryIds: assembly.citedMemoryIds,
    citedMemories: assembly.citedMemories,
    recalledMemorySnapshots: assembly.recalledMemorySnapshots,
    recallSource: assembly.recallSource,
    citationSource: assembly.citationSource,
    citationWarnings: assembly.citationWarnings,
    droppedInvalidIds: assembly.droppedInvalidIds,
  };
}
