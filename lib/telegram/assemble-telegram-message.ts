import type { CitationSource } from "@/lib/telegram/citation-enforcement";
import {
  enforceCitationInMessage,
  type CitedMemoryPayload,
} from "@/lib/telegram/citation-enforcement";
import { formatReceiptFooter } from "@/lib/telegram/recall-for-telegram";
import type { MessageRecallBackend } from "@/lib/telegram/message-recall-backend";
import { primaryRecallSource } from "@/lib/telegram/message-recall-backend";
import {
  toRecalledMemorySnapshots,
  type RecalledMemorySnapshot,
} from "@/lib/telegram/recalled-memory-snapshot";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";
import { recallMemoriesForTelegramMatch } from "@/lib/telegram/recall-for-telegram-match";
import type { Match } from "@/lib/mock/types";

export type TelegramMessageAssembly = {
  message: string;
  citedMemories: CitedMemoryPayload[];
  citedMemoryIds: string[];
  recalledMemories: TelegramRankedMemory[];
  recalledMemorySnapshots: RecalledMemorySnapshot[];
  recallSource: MessageRecallBackend;
  citationSource: CitationSource;
  citationWarnings: string[];
  droppedInvalidIds: string[];
  publicProfileUrl?: string;
};

export function finalizeTelegramMessage(input: {
  recalledMemories: TelegramRankedMemory[];
  llmMessage: string;
  citedMemoryIds?: string[];
  publicSlug?: string | null;
  appUrl?: string;
  requireStrongCitations?: boolean;
}): TelegramMessageAssembly {
  const enforcement = enforceCitationInMessage(
    input.llmMessage,
    input.recalledMemories,
    input.citedMemoryIds,
    input.requireStrongCitations
      ? { minCitations: 2, minCitationsWhenRecalledAtLeast: 3 }
      : undefined,
  );

  const profilePath =
    input.publicSlug && input.appUrl
      ? `${input.appUrl.replace(/\/$/, "")}/u/${input.publicSlug}`
      : input.publicSlug
        ? `/u/${input.publicSlug}`
        : undefined;

  const footerMemories = enforcement.citedMemories.map((m) => ({
    text: m.text,
    id: m.id,
  }));

  return {
    message: `${enforcement.message.trim()}${formatReceiptFooter(footerMemories)}`,
    citedMemories: enforcement.citedMemories,
    citedMemoryIds: enforcement.citedMemories
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id)),
    recalledMemories: input.recalledMemories,
    recalledMemorySnapshots: toRecalledMemorySnapshots(input.recalledMemories),
    recallSource: primaryRecallSource(input.recalledMemories),
    citationSource: enforcement.citationSource,
    citationWarnings: enforcement.citationWarnings,
    droppedInvalidIds: enforcement.droppedInvalidIds,
    publicProfileUrl: profilePath,
  };
}

export async function recallMemoriesForTelegramMessage(input: {
  userId: string;
  match: Match;
  favoriteTeam?: string | null;
  rivalTeam?: string | null;
  preferredStyle?: string | null;
  userPick?: string | null;
  emphasizeLive?: boolean;
}): Promise<TelegramRankedMemory[]> {
  return recallMemoriesForTelegramMatch(input.userId, input.match, {
    favoriteTeam: input.favoriteTeam,
    rivalTeam: input.rivalTeam,
    preferredStyle: input.preferredStyle,
    userPick: input.userPick,
    emphasizeLive: input.emphasizeLive,
  });
}
