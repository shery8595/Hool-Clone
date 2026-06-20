import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { onboardingQuestions } from "@/lib/onboarding/questions";
import {
  getAnsweredQuestionIds,
  saveOnboardingAnswer,
} from "@/lib/onboarding/service";

const bodySchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1).max(500),
  driver: z.enum(["stats", "vibes", "loyalty", "chaos"]).optional(),
});

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());

    const question = onboardingQuestions.find((q) => q.id === body.questionId);
    if (!question) {
      return NextResponse.json({ error: "Unknown question" }, { status: 400 });
    }

    const result = await saveOnboardingAnswer(me.id, {
      questionId: body.questionId,
      question: question.question,
      answer: body.answer,
      driver: body.driver,
    });

    const answeredIds = await getAnsweredQuestionIds(me.id);

    return NextResponse.json({
      storedSummary: result.storedSummary,
      maturityLabel: result.maturityLabel,
      answeredCount: answeredIds.length,
      memoryIds: result.memoryIds,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }
    console.error("POST /api/onboarding/answer", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
