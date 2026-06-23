import { memoryCountToMaturity } from "@/lib/auth/maturity";
import { encryptMemoryForUser } from "@/lib/crypto/memory-crypto";
import { query, queryOne } from "@/lib/db/client";
import {
  countMemories,
  syncCloneMaturity,
  updateFanProfile,
  type MeResponse,
} from "@/lib/db/users";
import { extractMemoryFromAnswer } from "@/lib/onboarding/extract-memory";
import { getMemoryAdapter } from "@/lib/memory";
import type { DriverChip } from "@/lib/mock/types";

type AnswerRow = {
  question_id: string;
};

export async function getAnsweredQuestionIds(userId: string): Promise<string[]> {
  const rows = await query<AnswerRow>(
    "select question_id from onboarding_answers where user_id = $1",
    [userId],
  );
  return rows.map((r) => r.question_id);
}

export async function getOnboardingDrivers(
  userId: string,
): Promise<DriverChip[]> {
  const rows = await query<{ driver: string | null }>(
    `select driver from onboarding_answers
     where user_id = $1 and driver is not null`,
    [userId],
  );
  const valid: DriverChip[] = ["stats", "vibes", "loyalty", "chaos"];
  return rows
    .map((r) => r.driver)
    .filter(
      (d): d is DriverChip =>
        typeof d === "string" && valid.includes(d as DriverChip),
    );
}

export async function saveOnboardingAnswer(
  userId: string,
  input: {
    questionId: string;
    question: string;
    answer: string;
    driver?: DriverChip;
  },
): Promise<{
  storedSummary: string;
  memoryIds: string[];
  maturityLabel: MeResponse["profile"]["cloneMaturityLabel"];
}> {
  const extraction = await extractMemoryFromAnswer({
    question: input.question,
    answer: input.answer,
    driver: input.driver,
  });

  await query(
    `insert into onboarding_answers (user_id, question_id, answer_text, driver, extracted_summary)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id, question_id) do update set
       answer_text = excluded.answer_text,
       driver = excluded.driver,
       extracted_summary = excluded.extracted_summary,
       updated_at = now()`,
    [
      userId,
      input.questionId,
      input.answer,
      input.driver ?? null,
      extraction.summaryLine,
    ],
  );

  const memoryAdapter = getMemoryAdapter();
  const memoryIds: string[] = [];

  for (const fact of extraction.facts) {
    let text = fact.text;
    const metadata: Record<string, unknown> = {
      questionId: input.questionId,
      driver: fact.driver ?? input.driver,
      team: fact.team,
      source: "onboarding",
    };

    if (fact.type === "emotional_memory") {
      const searchText =
        fact.searchText ??
        `Emotional football memory bias${fact.team ? ` (${fact.team})` : ""}`;
      const encrypted = await encryptMemoryForUser(userId, fact.text);
      text = searchText;
      Object.assign(metadata, {
        encrypted: true,
        searchText,
        ciphertext: encrypted.ciphertextB64,
        encryptionNonce: encrypted.nonceB64,
        encryptionVersion: encrypted.version,
      });
    }

    const result = await memoryAdapter.remember(userId, {
      type: fact.type,
      text,
      metadata,
    });
    if (result.id) memoryIds.push(result.id);
  }

  const existingSummary = await queryOne<{ summary: string | null }>(
    "select summary from fan_profiles where user_id = $1",
    [userId],
  );

  const nextSummary = existingSummary?.summary
    ? `${existingSummary.summary} ${extraction.summaryLine}`
    : extraction.summaryLine;

  await updateFanProfile(userId, {
    favoriteTeam: extraction.profileHints?.favoriteTeam,
    rivalTeam: extraction.profileHints?.rivalTeam,
    preferredStyle: extraction.profileHints?.preferredStyle,
    summary: nextSummary.slice(0, 1000),
  });

  await syncCloneMaturity(userId);

  const memoriesCount = await countMemories(userId);
  const maturity = memoryCountToMaturity(memoriesCount);

  return {
    storedSummary: extraction.summaryLine,
    memoryIds,
    maturityLabel: maturity.label,
  };
}

export async function completeOnboarding(userId: string): Promise<void> {
  await query(
    `update fan_profiles
     set onboarding_complete = true, updated_at = now()
     where user_id = $1`,
    [userId],
  );
  await syncCloneMaturity(userId);
}
