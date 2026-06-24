export const JUDGE_DEMO_CORRECTION_MIN_LENGTH = 8;
export const JUDGE_DEMO_CORRECTION_MAX_LENGTH = 500;

export function parseJudgeDemoCorrectionText(
  value: unknown,
): { ok: true; text: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return { ok: false, error: "correctionText must be a string." };
  }

  const text = value.trim();
  if (text.length < JUDGE_DEMO_CORRECTION_MIN_LENGTH) {
    return {
      ok: false,
      error: `Correction must be at least ${JUDGE_DEMO_CORRECTION_MIN_LENGTH} characters.`,
    };
  }
  if (text.length > JUDGE_DEMO_CORRECTION_MAX_LENGTH) {
    return {
      ok: false,
      error: `Correction must be at most ${JUDGE_DEMO_CORRECTION_MAX_LENGTH} characters.`,
    };
  }

  return { ok: true, text };
}
