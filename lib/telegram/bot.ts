import { Bot } from "grammy";
import { memoryCountToMaturity } from "@/lib/auth/maturity";
import {
  buildWalletAuthMessage,
  createWalletChallenge,
  normalizeWalletAddress,
  verifyWalletChallengeToken,
  walletAddressesMatch,
} from "@/lib/auth/wallet-challenge";
import { verifyWalletPersonalMessage } from "@/lib/auth/verify-wallet-signature";
import { getClonePredictionForMatch } from "@/lib/db/clone-predictions";
import { getUserPredictionForMatch } from "@/lib/db/predictions";
import {
  buildMeResponse,
  countMemories,
  findOrCreateUserByWallet,
  getFanProfile,
} from "@/lib/db/users";
import { getAppUrl, getTelegramBotToken } from "@/lib/env";
import {
  clearPendingLink,
  findUserByChatId,
  getPendingLink,
  linkChatToUser,
  revokeChatLink,
  setNotificationsEnabled,
  setPendingLink,
} from "@/lib/telegram/link-account";
import { verifyTelegramLinkToken } from "@/lib/telegram/link-token";
import { assemblyToStoreFields } from "@/lib/telegram/assembly-to-store";
import { buildRoastMessage } from "@/lib/telegram/roast";
import { inferRoastContext } from "@/lib/telegram/infer-roast-match";
import { sendAndStoreTelegramMessage } from "@/lib/telegram/send-and-store";

let bot: Bot | null = null;

export function getTelegramBot(): Bot | null {
  const token = getTelegramBotToken();
  if (!token) return null;

  if (!bot) {
    bot = new Bot(token);
    registerHandlers(bot);
  }

  return bot;
}

function registerHandlers(instance: Bot): void {
  instance.command("start", async (ctx) => {
    const payload = ctx.match?.trim() ?? "";

    if (payload.startsWith("link_")) {
      const token = payload.slice("link_".length);
      try {
        const { userId } = await verifyTelegramLinkToken(token);
        await linkChatToUser(userId, ctx.chat.id, {
          enableNotifications: true,
        });

        const me = await buildMeResponse(userId);
        const evolutionUrl =
          me?.publicSlug && me.profile.publicEnabled
            ? `${getAppUrl()}/u/${me.publicSlug}/evolution`
            : null;

        const lines = [
          `Linked as ${me?.displayName ?? "HoolClone fan"}!`,
          "Match alerts are ON.",
          "Your clone will DM you after every result — congrats or roast, with Walrus receipts.",
          "/notifications off — mute alerts",
          "/roast — get roasted on demand",
          "/roast m071 — roast a specific match",
        ];
        if (evolutionUrl) {
          lines.push(`Evolution: ${evolutionUrl}`);
        }

        await ctx.reply(lines.join("\n"));
      } catch (error) {
        await ctx.reply(
          error instanceof Error
            ? `Link failed: ${error.message}. Request a new link from the web app.`
            : "Link failed. Request a new link from the web app.",
        );
      }
      return;
    }

    const linked = await findUserByChatId(ctx.chat.id);
    if (linked) {
      const profile = await getFanProfile(linked.userId);
      const count = await countMemories(linked.userId);
      const maturity = memoryCountToMaturity(count);
      await ctx.reply(
        `HoolClone linked.\nMaturity: ${maturity.label}\nFavorite: ${profile?.favorite_team ?? "unknown"}\n\n/roast — get roasted\n/roast m071 — roast a match\n/predict m071 — your picks\n/notifications on|off — match alerts`,
      );
      return;
    }

    await ctx.reply(
      "Welcome to HoolClone — your football hooligan clone.\n\n/link <wallet> then /verify <signature> to connect.\n/roast works after linking.",
    );
  });

  instance.command("link", async (ctx) => {
    const walletArg = ctx.match?.trim();
    if (!walletArg) {
      await ctx.reply("Usage: /link <your-sui-wallet-address>");
      return;
    }

    try {
      const walletAddress = normalizeWalletAddress(walletArg);
      const user = await findOrCreateUserByWallet(walletAddress);
      await linkChatToUser(user.id, ctx.chat.id);

      const challenge = await createWalletChallenge(walletAddress);
      await setPendingLink(ctx.chat.id, walletAddress, challenge.challengeToken);

      await ctx.reply(
        `Sign this message in your Sui wallet, then send:\n/verify <signature>\n\n${challenge.message}`,
      );
    } catch (error) {
      await ctx.reply(
        error instanceof Error ? error.message : "Failed to start wallet link.",
      );
    }
  });

  instance.command("verify", async (ctx) => {
    const signature = ctx.match?.trim();
    if (!signature) {
      await ctx.reply("Usage: /verify <signature-from-wallet>");
      return;
    }

    const pending = await getPendingLink(ctx.chat.id);
    if (!pending) {
      await ctx.reply("Run /link <wallet> first.");
      return;
    }

    try {
      const challenge = await verifyWalletChallengeToken(pending.challengeToken);
      if (!walletAddressesMatch(challenge.walletAddress, pending.walletAddress)) {
        await ctx.reply("Challenge wallet mismatch.");
        return;
      }

      const message = buildWalletAuthMessage(
        challenge.walletAddress,
        challenge.nonce,
      );

      await verifyWalletPersonalMessage({
        message,
        signature,
        walletAddress: challenge.walletAddress,
      });

      const user = await findOrCreateUserByWallet(challenge.walletAddress);
      await linkChatToUser(user.id, ctx.chat.id);
      await clearPendingLink(ctx.chat.id);

      const me = await buildMeResponse(user.id);
      await ctx.reply(
        `Linked as ${me?.displayName ?? challenge.walletAddress.slice(0, 10)}…\nNotifications are OFF. Send /notifications on for post-loss roasts.`,
      );
    } catch (error) {
      await ctx.reply(
        error instanceof Error ? error.message : "Verification failed.",
      );
    }
  });

  instance.command("notifications", async (ctx) => {
    const arg = ctx.match?.trim().toLowerCase();
    if (arg !== "on" && arg !== "off") {
      await ctx.reply("Usage: /notifications on | /notifications off");
      return;
    }

    const linked = await findUserByChatId(ctx.chat.id);
    if (!linked) {
      await ctx.reply("Link your wallet first: /link <wallet>");
      return;
    }

    const ok = await setNotificationsEnabled(ctx.chat.id, arg === "on");
    if (!ok) {
      await ctx.reply("Could not update notifications.");
      return;
    }

    await ctx.reply(
      arg === "on"
        ? "Match alerts enabled. Your clone will DM you after every result — congrats or roast."
        : "Notifications off.",
    );
  });

  instance.command("unlink", async (ctx) => {
    const ok = await revokeChatLink(ctx.chat.id);
    await ctx.reply(ok ? "Unlinked. /link to connect again." : "No active link.");
  });

  instance.command("roast", async (ctx) => {
    const linked = await findUserByChatId(ctx.chat.id);
    if (!linked) {
      await ctx.reply("Link your wallet first: /link <wallet>");
      return;
    }

    const matchArg = ctx.match?.trim() || undefined;
    const inferred = await inferRoastContext(linked.userId, matchArg);

    const roast = await buildRoastMessage({
      userId: linked.userId,
      publicSlug: linked.publicSlug,
      appUrl: getAppUrl(),
      match: inferred?.match,
      matchContext: inferred?.matchContext,
      wrongPick: inferred?.wrongPick,
      actualWinner: inferred?.actualWinner,
    });

    await sendAndStoreTelegramMessage({
      userId: linked.userId,
      chatId: String(ctx.chat.id),
      matchId: inferred?.matchDbId,
      messageType: "on_demand_roast",
      ...assemblyToStoreFields(roast),
      metadata: {
        matchExternalId: inferred?.match.id,
        inferred: Boolean(!matchArg && inferred),
        requestedMatchId: matchArg,
      },
    });
  });

  instance.command("predict", async (ctx) => {
    const matchId = ctx.match?.trim();
    if (!matchId) {
      await ctx.reply("Usage: /predict <matchId> (e.g. m071)");
      return;
    }

    const linked = await findUserByChatId(ctx.chat.id);
    if (!linked) {
      await ctx.reply("Link your wallet first: /link <wallet>");
      return;
    }

    const [human, clone] = await Promise.all([
      getUserPredictionForMatch(linked.userId, matchId),
      getClonePredictionForMatch(linked.userId, matchId),
    ]);

    if (!human) {
      await ctx.reply(`No prediction for ${matchId} yet. Predict on the web app.`);
      return;
    }

    const lines = [
      `Your pick (${matchId}): ${human.winner} ${human.homeScore}-${human.awayScore}`,
      human.reasoning ? `Reason: ${human.reasoning}` : "",
    ];

    if (clone) {
      lines.push(
        `Clone pick: ${clone.clone.winner} ${clone.clone.homeScore}-${clone.clone.awayScore}`,
        clone.clone.reasoning ? `Clone: ${clone.clone.reasoning}` : "",
        "Note: receipts below are from the stored clone prediction, not a fresh Walrus recall.",
      );
      if (clone.clone.receipts?.length) {
        lines.push("Receipts:");
        for (const r of clone.clone.receipts.slice(0, 3)) {
          lines.push(`• ${r.text}`);
        }
      }
    }

    if (linked.publicSlug) {
      lines.push(`Profile: ${getAppUrl()}/u/${linked.publicSlug}`);
    }

    await ctx.reply(lines.filter(Boolean).join("\n"));
  });
}

export async function handleTelegramUpdate(
  update: Parameters<Bot["handleUpdate"]>[0],
): Promise<void> {
  const instance = getTelegramBot();
  if (!instance) {
    throw new Error("Telegram bot is not configured");
  }
  await instance.handleUpdate(update);
}
