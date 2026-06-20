import type { ContradictionFinding } from "@/lib/clone/contradiction-hunter";
import type { DebateTurnAnalysis } from "@/lib/debate/analyze-debate-turn";

export function filterDebateContradictions(
  contradictions: ContradictionFinding[],
  analysis: DebateTurnAnalysis,
  memoryTexts: string[],
): ContradictionFinding[] {
  let filtered = contradictions;

  if (analysis.denyingPriorClaim || analysis.denyingStyleClaim) {
    filtered = filtered.filter((c) => c.kind !== "style");
  }

  if (analysis.mentionedEntities.length > 0) {
    const entityKinds = new Set<ContradictionFinding["kind"]>();
    for (const entity of analysis.mentionedEntities) {
      if (["england", "brazil", "portugal", "france", "argentina"].includes(entity)) {
        entityKinds.add("loyalty");
        entityKinds.add("rival");
      }
    }
    const entityRelevant = filtered.filter((c) => entityKinds.has(c.kind));
    if (entityRelevant.length > 0) filtered = entityRelevant;
  }

  const loyaltyMemories = memoryTexts.filter((t) =>
    /\b(loyal|loyalty)\b/i.test(t),
  ).length;
  const statsMemories = memoryTexts.filter((t) =>
    /\bstats?\b/i.test(t),
  ).length;
  if (statsMemories <= loyaltyMemories) {
    filtered = filtered.filter((c) => c.kind !== "style");
  }

  return filtered;
}
