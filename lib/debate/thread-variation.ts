import type { ContradictionFinding } from "@/lib/clone/contradiction-hunter";
import type { DebateTurnAnalysis, DebateTopic } from "@/lib/debate/analyze-debate-turn";
import type { DebateMessage } from "@/lib/mock/types";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 3),
  );
}

/** Rough overlap — catches the clone repeating the same roast line. */
export function isRepeatingReply(
  candidate: string,
  priorCloneTexts: string[],
): boolean {
  const normalized = normalize(candidate);
  for (const prior of priorCloneTexts) {
    const priorNorm = normalize(prior);
    if (priorNorm.length < 20) continue;
    if (normalized === priorNorm) return true;
    if (
      normalized.includes(priorNorm.slice(0, 60)) ||
      priorNorm.includes(normalized.slice(0, 60))
    ) {
      return true;
    }

    const a = tokenSet(candidate);
    const b = tokenSet(prior);
    if (a.size === 0 || b.size === 0) continue;
    let overlap = 0;
    for (const token of a) {
      if (b.has(token)) overlap += 1;
    }
    const ratio = overlap / Math.min(a.size, b.size);
    if (ratio >= 0.72) return true;
  }
  return false;
}

export function extractPriorCloneTexts(messages: DebateMessage[]): string[] {
  return messages
    .filter((m) => m.role === "clone")
    .map((m) => m.text.trim())
    .filter(Boolean);
}

export function countCloneTurns(messages: DebateMessage[]): number {
  return messages.filter((m) => m.role === "clone").length;
}

export function filterFreshContradictions(
  contradictions: ContradictionFinding[],
  priorCloneTexts: string[],
): ContradictionFinding[] {
  return contradictions.filter(
    (c) => !priorCloneTexts.some((t) => t.includes(c.text.slice(0, 50))),
  );
}

export function pickContradictionForTurn(
  contradictions: ContradictionFinding[],
  analysis: DebateTurnAnalysis,
  turnIndex: number,
): ContradictionFinding | null {
  if (contradictions.length === 0) return null;

  const fresh = filterFreshContradictions(
    contradictions,
    analysis.priorCloneTexts,
  );
  const pool = fresh.length > 0 ? fresh : contradictions;

  const topic = analysis.topics.find((t) => t !== "general") as
    | DebateTopic
    | undefined;
  if (topic) {
    const byTopic = pool.find((c) => c.kind === topic);
    if (byTopic) return byTopic;
  }

  return pool[turnIndex % pool.length] ?? pool[0] ?? null;
}
