import { queryOne } from "@/lib/db/client";
import { JUDGE_DEMO_SLUG } from "@/lib/judge-demo/constants";

export async function getJudgeDemoUserId(): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `select id from users where public_slug = $1`,
    [JUDGE_DEMO_SLUG],
  );
  return row?.id ?? null;
}
