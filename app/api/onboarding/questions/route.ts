import { NextResponse } from "next/server";
import { memoryCountToMaturity } from "@/lib/auth/maturity";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { query } from "@/lib/db/client";
import { countMemories } from "@/lib/db/users";
import { onboardingQuestions } from "@/lib/onboarding/questions";

type AnswerRow = {
  question_id: string;
  answer_text: string;
  driver: string | null;
};

export async function GET() {
  try {
    const userId = await requireUserId();
    const [answers, memoriesCount] = await Promise.all([
      query<AnswerRow>(
        "select question_id, answer_text, driver from onboarding_answers where user_id = $1",
        [userId],
      ),
      countMemories(userId),
    ]);

    const answerMap = new Map(answers.map((a) => [a.question_id, a]));
    const answeredIds = new Set(answers.map((a) => a.question_id));
    const maturity = memoryCountToMaturity(memoriesCount);

    const questions = onboardingQuestions.map((q) => {
      const prev = answerMap.get(q.id);
      return {
        id: q.id,
        question: q.question,
        placeholder: q.placeholder,
        maxLength: q.maxLength,
        answered: answeredIds.has(q.id),
        previousAnswer: prev?.answer_text,
        previousDriver: prev?.driver as
          | "stats"
          | "vibes"
          | "loyalty"
          | "chaos"
          | undefined,
      };
    });

    return NextResponse.json({
      questions,
      answeredCount: answeredIds.size,
      maturityLabel: maturity.label,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/onboarding/questions", error);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}
