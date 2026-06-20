import { alignCitationsToTurn } from "@/lib/debate/align-citations";
import { buildDebateContext } from "@/lib/debate/build-debate-context";
import { buildFallbackDebateReply } from "@/lib/debate/fallback-debate-reply";
import {
  buildDebateSystemPrompt,
  buildDebateUserPrompt,
} from "@/lib/debate/prompts";
import { trySpecializedDebateReply } from "@/lib/debate/specialized-replies";
import {
  isRepeatingReply,
  pickContradictionForTurn,
} from "@/lib/debate/thread-variation";
import type { GenerateDebateReplyResult } from "@/lib/debate/types";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import { SchemaType } from "@google/generative-ai";
import type { DebateMessage } from "@/lib/mock/types";

const debateReplySchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: { type: SchemaType.STRING },
    citedMemoryIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["reply"],
};

export async function generateDebateReply(
  userId: string,
  input: {
    userMessage: string;
    recentMessages: DebateMessage[];
  },
): Promise<GenerateDebateReplyResult> {
  const ctx = await buildDebateContext(userId, input);

  const runFallback = () =>
    buildFallbackDebateReply({
      userMessage: input.userMessage,
      analysis: ctx.analysis,
      catalog: ctx.rankedCatalog,
      contradictions: ctx.contradictions,
      allContradictions: ctx.allContradictions,
      predictionRebuttal: ctx.predictionRebuttal,
      maturityLabel: ctx.maturityLabel,
    });

  const specialized = trySpecializedDebateReply({
    userMessage: input.userMessage,
    analysis: ctx.analysis,
    catalog: ctx.rankedCatalog,
  });
  if (
    specialized &&
    (ctx.analysis.denyingPriorClaim ||
      ctx.analysis.denyingStyleClaim ||
      ctx.analysis.playerComparison ||
      ctx.analysis.matchupQuestion ||
      (ctx.analysis.winnerClaim && ctx.analysis.searchTerms.length > 0) ||
      /\b(despise|hate most)\b/i.test(input.userMessage))
  ) {
    return specialized;
  }

  const llm = getLlmAdapter();
  if (llm) {
    try {
      const result = await llm.generateJson<{
        reply: string;
        citedMemoryIds?: string[];
      }>({
        system: buildDebateSystemPrompt(ctx.maturityLabel),
        user: buildDebateUserPrompt({
          profileSummary: ctx.profile?.summary ?? null,
          favoriteTeam: ctx.profile?.favorite_team ?? null,
          rivalTeam: ctx.profile?.rival_team ?? null,
          preferredStyle: ctx.profile?.preferred_style ?? null,
          maturityLabel: ctx.maturityLabel,
          memoriesCount: ctx.memoriesCount,
          contradictions: ctx.contradictions,
          predictionDigest: ctx.predictionDigest,
          predictionRebuttal: ctx.predictionRebuttal,
          catalogBlock: ctx.catalogBlock,
          analysis: ctx.analysis,
          transcript: ctx.transcript,
          userMessage: input.userMessage,
          bannedLines: ctx.analysis.priorCloneTexts,
        }),
        schemaName: "DebateReply",
        schema: debateReplySchema,
      });

      if (result.reply?.trim()) {
        const text = result.reply.trim();
        if (isRepeatingReply(text, ctx.analysis.priorCloneTexts)) {
          return runFallback();
        }
        return {
          text,
          citedReceipts: alignCitationsToTurn(
            text,
            result.citedMemoryIds,
            ctx.rankedCatalog,
            input.userMessage,
            ctx.analysis,
          ),
        };
      }
    } catch {
      // rule-based fallback below
    }
  }

  return runFallback();
}

export async function generateDebateOpening(
  userId: string,
  options?: { variantIndex?: number },
): Promise<GenerateDebateReplyResult> {
  const variant = options?.variantIndex ?? 0;
  const ctx = await buildDebateContext(userId, {
    userMessage: "open debate challenge my football takes",
    recentMessages: [],
  });

  const nonCorrectionReceipts = ctx.rankedCatalog.filter(
    (r) => !r.text.toLowerCase().startsWith("correction:"),
  );
  const topReceipt =
    nonCorrectionReceipts[variant % Math.max(nonCorrectionReceipts.length, 1)] ??
    ctx.rankedCatalog[0];

  const contradiction = pickContradictionForTurn(
    ctx.contradictions,
    ctx.analysis,
    variant,
  );

  if (topReceipt && variant % 2 === 1) {
    return {
      text: `Pick a fight about football — I'll argue from receipt #${topReceipt.number ?? 1}: "${topReceipt.text.slice(0, 100)}${topReceipt.text.length > 100 ? "…" : ""}"`,
      citedReceipts: [topReceipt],
    };
  }

  if (contradiction && topReceipt) {
    return {
      text: `I've got receipts on you. ${contradiction.text} Challenge me if you think I'm wrong.`,
      citedReceipts: [topReceipt],
    };
  }

  if (topReceipt) {
    return {
      text: `Pick a fight about football — I'll argue from receipt #${topReceipt.number ?? 1}: "${topReceipt.text.slice(0, 100)}${topReceipt.text.length > 100 ? "…" : ""}"`,
      citedReceipts: [topReceipt],
    };
  }

  if (ctx.profile?.summary?.trim()) {
    return {
      text: `${ctx.profile.summary.trim()} Challenge any take — I'm still building memory.`,
      citedReceipts: [],
    };
  }

  return {
    text: "Challenge me on any football take. I'll argue from what I remember — cite receipts when I've got them.",
    citedReceipts: [],
  };
}
