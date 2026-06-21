import type { RecallSource } from "@/lib/mock/types";
import type { CitedMemoryPayload } from "@/lib/telegram/citation-enforcement";
import { enforceCitationInMessage } from "@/lib/telegram/citation-enforcement";
import { formatReceiptFooter } from "@/lib/telegram/recall-for-telegram";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";
import {
  primaryRecallSource,
  recallMemoriesForTelegramMatch,
} from "@/lib/telegram/recall-for-telegram-match";
import type { Match } from "@/lib/mock/types";

export type TelegramMessageAssembly = {
  message: string;
  citedMemories: CitedMemoryPayload[];
  citedMemoryIds: string[];
  recalledMemories: TelegramRankedMemory[];
  recallSource?: RecallSource;
  publicProfileUrl?: string;
};

export function finalizeTelegramMessage(input: {
  recalledMemories: TelegramRankedMemory[];
  llmMessage: string;
  citedMemoryIds?: string[];
  publicSlug?: string | null;
  appUrl?: string;
}): TelegramMessageAssembly {
  const { message: citedMessage, citedMemories } = enforceCitationInMessage(
    input.llmMessage,
    input.recalledMemories,
    input.citedMemoryIds,
  );

  const profilePath =
    input.publicSlug && input.appUrl
      ? `${input.appUrl.replace(/\/$/, "")}/u/${input.publicSlug}`
      : input.publicSlug
        ? `/u/${input.publicSlug}`
        : undefined;

  const footerMemories = citedMemories.map((m) => ({
    text: m.text,
    id: m.id,
  }));

  return {
    message: `${citedMessage.trim()}${formatReceiptFooter(footerMemories, profilePath)}`,
    citedMemories,
    citedMemoryIds: citedMemories
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id)),
    recalledMemories: input.recalledMemories,
    recallSource: primaryRecallSource(input.recalledMemories),
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
