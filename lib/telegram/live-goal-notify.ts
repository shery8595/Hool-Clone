import { query } from "@/lib/db/client";
import { getAppUrl } from "@/lib/env";
import { getMemoryAdapter } from "@/lib/memory";
import { loadMatchByDbId } from "@/lib/match-data/load-match-by-id";
import type { LiveGoalEvent } from "@/lib/match-data/sync-match-results";
import { loadRecentLiveGoalEvents } from "@/lib/match-data/sync-match-results";
import { buildLiveGoalMessage } from "@/lib/telegram/live-goal-message";
import { assemblyToStoreFields } from "@/lib/telegram/assembly-to-store";
import type { CitedMemoryPayload } from "@/lib/telegram/citation-enforcement";
import { buildLiveGoalFollowUpMemoryText } from "@/lib/telegram/telegram-follow-up-memory";
import { getTelegramBot } from "@/lib/telegram/bot";
import {
  hasTelegramMessageForEvent,
  sendAndStoreTelegramMessage,
} from "@/lib/telegram/send-and-store";

type SubscriberRow = {
  chat_id: string;
  user_id: string;
  public_slug: string | null;
  favorite_team: string | null;
  predicted_winner: string | null;
  linked_at: Date;
};

function buildLiveGoalMemoryText(input: {
  matchLabel: string;
  scoringTeam: string | null;
  situation: string;
  citedMemories: CitedMemoryPayload[];
}): string {
  return buildLiveGoalFollowUpMemoryText(input);
}

function resolveSituation(
  sub: SubscriberRow,
  event: LiveGoalEvent,
): "scored" | "conceded" | "neutral" | null {
  const favoriteInMatch =
    sub.favorite_team &&
    (event.teamACode === sub.favorite_team ||
      event.teamBCode === sub.favorite_team);

  const predictedMatch = Boolean(sub.predicted_winner);
  if (!favoriteInMatch && !predictedMatch) return null;

  if (favoriteInMatch && event.scoringTeamCode) {
    if (event.scoringTeamCode === sub.favorite_team) return "scored";
    return "conceded";
  }

  if (predictedMatch) return "neutral";
  return null;
}

function mergeLiveGoalEvents(...lists: LiveGoalEvent[][]): LiveGoalEvent[] {
  const byId = new Map<string, LiveGoalEvent>();
  for (const list of lists) {
    for (const event of list) {
      byId.set(event.eventId, event);
    }
  }
  return [...byId.values()];
}

export async function processLiveGoalNotifications(
  events: LiveGoalEvent[],
): Promise<{ processed: number; notified: number }> {
  const bot = getTelegramBot();
  const allEvents = mergeLiveGoalEvents(events, await loadRecentLiveGoalEvents());
  if (!bot || allEvents.length === 0) {
    return { processed: allEvents.length, notified: 0 };
  }

  const appUrl = getAppUrl();
  let notified = 0;

  for (const event of allEvents) {
    const match = await loadMatchByDbId(event.matchId);
    if (!match?.homeTeam || !match.awayTeam) continue;
    if (match.status === "final") continue;

    const subscribers = await query<SubscriberRow>(
      `select distinct tc.chat_id, tc.user_id, tc.created_at as linked_at, u.public_slug,
              fp.favorite_team, p.predicted_winner
       from telegram_chats tc
       join users u on u.id = tc.user_id
       join fan_profiles fp on fp.user_id = tc.user_id
       left join predictions p on p.user_id = tc.user_id and p.match_id = $1
       where tc.notifications_enabled = true
         and tc.revoked_at is null`,
      [event.matchId],
    );

    const matchLabel = `${event.teamACode} vs ${event.teamBCode} (${event.scoreA}-${event.scoreB})`;

    for (const sub of subscribers) {
      try {
        if (
          event.occurredAt &&
          new Date(sub.linked_at) > new Date(event.occurredAt)
        ) {
          continue;
        }

        if (
          await hasTelegramMessageForEvent(sub.user_id, "live_goal", event.eventId)
        ) {
          continue;
        }

        const situation = resolveSituation(sub, event);
        if (!situation) continue;

        const messageResult = await buildLiveGoalMessage({
          userId: sub.user_id,
          match,
          publicSlug: sub.public_slug,
          appUrl,
          matchContext: matchLabel,
          scoringTeamCode: event.scoringTeamCode,
          favoriteTeam: sub.favorite_team,
          userPick: sub.predicted_winner,
          situation,
        });

        await sendAndStoreTelegramMessage({
          userId: sub.user_id,
          chatId: sub.chat_id,
          matchId: event.matchId,
          messageType: "live_goal",
          ...assemblyToStoreFields(messageResult),
          metadata: {
            eventId: event.eventId,
            matchExternalId: event.externalId,
            scoringTeamCode: event.scoringTeamCode,
            situation,
            scoreA: event.scoreA,
            scoreB: event.scoreB,
          },
        });

        try {
          await getMemoryAdapter().remember(sub.user_id, {
            type: "prediction_history_summary",
            text: buildLiveGoalMemoryText({
              matchLabel,
              scoringTeam: event.scoringTeamCode,
              situation,
              citedMemories: messageResult.citedMemories,
            }),
            metadata: {
              source: "telegram_live_goal",
              matchId: event.externalId,
              eventId: event.eventId,
              scoringTeamCode: event.scoringTeamCode ?? undefined,
              situation,
              scoreA: event.scoreA,
              scoreB: event.scoreB,
            },
          });

          await query(
            `update memories
             set public_visible = false
             where id = (
               select id from memories
               where user_id = $1
                 and metadata->>'source' = 'telegram_live_goal'
                 and metadata->>'eventId' = $2
               order by created_at desc
               limit 1
             )`,
            [sub.user_id, event.eventId],
          );
        } catch (memoryError) {
          console.error("live goal Walrus follow-up memory failed", {
            userId: sub.user_id,
            eventId: event.eventId,
            memoryError,
          });
        }

        notified += 1;
      } catch (error) {
        console.error("live goal Telegram notify failed", {
          userId: sub.user_id,
          eventId: event.eventId,
          error,
        });
      }
    }
  }

  return { processed: allEvents.length, notified };
}
