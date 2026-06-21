import { inferCitedReceipts } from "@/lib/debate/infer-citations";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import type {
  ClashDebateResult,
  ClashParticipant,
  ClashParticipantMeta,
  ClashTurn,
} from "@/lib/clash/types";
import { recallForClashBoth } from "@/lib/clash/recall-for-clash";
import {
  buildClashDebateUserPrompt,
  CLASH_DEBATE_SYSTEM,
} from "@/lib/prompts/clash-debate";
import type { Match, MemoryReceipt } from "@/lib/mock/types";
import { SchemaType } from "@google/generative-ai";

const clashDebateSchema = {
  type: SchemaType.OBJECT,
  properties: {
    turns: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          speaker: { type: SchemaType.STRING },
          text: { type: SchemaType.STRING },
          citedMemoryIds: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["speaker", "text"],
      },
    },
  },
  required: ["turns"],
};

function toParticipant(
  meta: ClashParticipantMeta,
  receipts: MemoryReceipt[],
): ClashParticipant {
  return {
    slug: meta.slug,
    displayName: meta.displayName,
    handle: meta.handle,
    maturityLabel: meta.maturityLabel,
    namespace: meta.namespace,
    receipts,
  };
}

function buildFallbackTurns(
  match: Match,
  metaA: ClashParticipantMeta,
  metaB: ClashParticipantMeta,
  receiptsA: MemoryReceipt[],
  receiptsB: MemoryReceipt[],
): ClashTurn[] {
  const home = match.homeTeam?.name ?? "Home";
  const away = match.awayTeam?.name ?? "Away";
  const receiptA = receiptsA[0];
  const receiptB = receiptsB[0];

  const turns: Array<{
    speaker: "A" | "B";
    text: string;
    catalog: MemoryReceipt[];
    receipt?: MemoryReceipt;
  }> = [
    {
      speaker: "A",
      text: `${home} vs ${away}? My clone backs ${metaA.favoriteTeam ?? home} — loyalty over spreadsheets, every time.`,
      catalog: receiptsA,
      receipt: receiptA,
    },
    {
      speaker: "B",
      text: `Easy for you — ${metaB.favoriteTeam ?? away} play with chaos energy. I am not buying the favorite narrative here.`,
      catalog: receiptsB,
      receipt: receiptB,
    },
    {
      speaker: "A",
      text: `Your receipts scream underdog bias. Mine say ${metaA.favoriteTeam ?? home} in tight games — Walrus remembers.`,
      catalog: receiptsA,
      receipt: receiptsA[1] ?? receiptA,
    },
    {
      speaker: "B",
      text: `Walrus receipts do not lie — ${metaB.rivalTeam ? `I never trust ${metaB.rivalTeam}` : "I pick with vibes"} and this fixture smells like an upset.`,
      catalog: receiptsB,
      receipt: receiptsB[1] ?? receiptB,
    },
    {
      speaker: "A",
      text: `Fine, but my namespace has months of takes. ${home} or ${away}, I am riding my fan brain.`,
      catalog: receiptsA,
      receipt: receiptsA[2] ?? receiptA,
    },
    {
      speaker: "B",
      text: `Two namespaces, two hooligans — judges can verify every blob. I am still taking ${away} and sleeping well.`,
      catalog: receiptsB,
      receipt: receiptsB[2] ?? receiptB,
    },
  ];

  return turns.map((t) => ({
    speaker: t.speaker,
    text: t.text,
    citedReceipts: t.receipt
      ? inferCitedReceipts(t.text, [t.receipt.id], t.catalog)
      : [],
  }));
}

function resolveTurns(
  rawTurns: Array<{
    speaker: string;
    text: string;
    citedMemoryIds?: string[];
  }>,
  receiptsA: MemoryReceipt[],
  receiptsB: MemoryReceipt[],
): ClashTurn[] {
  const expected: Array<"A" | "B"> = ["A", "B", "A", "B", "A", "B"];
  const resolved: ClashTurn[] = [];

  for (let i = 0; i < 6; i++) {
    const raw = rawTurns[i];
    const speaker = expected[i]!;
    const catalog = speaker === "A" ? receiptsA : receiptsB;
    const text = raw?.text?.trim() || `Turn ${i + 1} — arguing from Walrus memories.`;
    const ids =
      raw?.speaker?.toUpperCase() === speaker
        ? raw.citedMemoryIds
        : raw?.citedMemoryIds;

    resolved.push({
      speaker,
      text,
      citedReceipts: inferCitedReceipts(text, ids, catalog),
    });
  }

  return resolved;
}

export async function generateClashDebate(input: {
  match: Match;
  participantA: ClashParticipantMeta;
  participantB: ClashParticipantMeta;
}): Promise<ClashDebateResult> {
  const { receiptsA, receiptsB } = await recallForClashBoth(
    input.participantA,
    input.participantB,
    input.match,
  );

  const participantA = toParticipant(input.participantA, receiptsA);
  const participantB = toParticipant(input.participantB, receiptsB);

  const llm = getLlmAdapter();
  let turns: ClashTurn[];

  if (llm) {
    try {
      const result = await llm.generateJson<{
        turns: Array<{
          speaker: string;
          text: string;
          citedMemoryIds?: string[];
        }>;
      }>({
        system: CLASH_DEBATE_SYSTEM,
        user: buildClashDebateUserPrompt({
          match: input.match,
          participantA: input.participantA,
          participantB: input.participantB,
          receiptsA,
          receiptsB,
        }),
        schemaName: "clash_debate",
        schema: clashDebateSchema,
      });
      turns = resolveTurns(result.turns ?? [], receiptsA, receiptsB);
    } catch {
      turns = buildFallbackTurns(
        input.match,
        input.participantA,
        input.participantB,
        receiptsA,
        receiptsB,
      );
    }
  } else {
    turns = buildFallbackTurns(
      input.match,
      input.participantA,
      input.participantB,
      receiptsA,
      receiptsB,
    );
  }

  return {
    match: input.match,
    participantA,
    participantB,
    turns,
  };
}
