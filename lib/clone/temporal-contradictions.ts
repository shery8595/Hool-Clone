import type { StoredMemory } from "@/lib/memory/memory-adapter";

export type TemporalContradiction = {
  id: string;
  team: string;
  dateA: string;
  dateB: string;
  textA: string;
  textB: string;
  memoryIdA: string;
  memoryIdB: string;
};

const POSITIVE_SENTIMENT =
  /\b(favorites?|favourite|trust|back|believe|underrated|love|best|win|ride|bleed)\b/i;
const NEGATIVE_SENTIMENT =
  /\b(overrated|hate|distrust|don't trust|do not trust|skeptic|struggle|bad|fade|never)\b/i;

const TEAM_CODES =
  /\b(Portugal|Brazil|England|Spain|Argentina|Colombia|France|Germany|Italy|Netherlands|Belgium|Croatia|Mexico|USA|Uruguay|Japan|Korea|Morocco|Senegal|Nigeria|Ghana|Cameroon|Australia|Canada|Switzerland|Poland|Serbia|Denmark|Sweden|Wales|Scotland|Ecuador|Chile|Peru|Costa Rica|Panama|Qatar|Saudi Arabia|Iran|Tunisia)\b/gi;

function extractTeam(
  memory: StoredMemory,
): string | null {
  const metaTeam = memory.metadata?.team;
  if (typeof metaTeam === "string" && metaTeam.trim()) {
    return metaTeam.trim();
  }

  const match = memory.text.match(TEAM_CODES);
  return match?.[0] ?? null;
}

function sentimentPolarity(text: string): "positive" | "negative" | "neutral" {
  const hasPos = POSITIVE_SENTIMENT.test(text);
  const hasNeg = NEGATIVE_SENTIMENT.test(text);
  if (hasPos && !hasNeg) return "positive";
  if (hasNeg && !hasPos) return "negative";
  if (hasPos && hasNeg) return "neutral";
  return "neutral";
}

export function detectTemporalContradictions(
  memories: StoredMemory[],
): TemporalContradiction[] {
  const byTeam = new Map<string, StoredMemory[]>();

  for (const memory of memories) {
    const team = extractTeam(memory);
    if (!team) continue;
    const key = team.toLowerCase();
    const list = byTeam.get(key) ?? [];
    list.push(memory);
    byTeam.set(key, list);
  }

  const findings: TemporalContradiction[] = [];

  for (const [teamKey, teamMemories] of byTeam) {
    const sorted = [...teamMemories].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]!;
        const b = sorted[j]!;
        const polA = sentimentPolarity(a.text);
        const polB = sentimentPolarity(b.text);

        if (
          (polA === "positive" && polB === "negative") ||
          (polA === "negative" && polB === "positive")
        ) {
          const displayTeam =
            (typeof a.metadata?.team === "string" ? a.metadata.team : null) ??
            teamKey.charAt(0).toUpperCase() + teamKey.slice(1);

          findings.push({
            id: `${a.id}-${b.id}`,
            team: displayTeam,
            dateA: a.createdAt,
            dateB: b.createdAt,
            textA: a.text,
            textB: b.text,
            memoryIdA: a.id,
            memoryIdB: b.id,
          });
        }
      }
    }
  }

  return findings.sort(
    (x, y) => new Date(x.dateB).getTime() - new Date(y.dateB).getTime(),
  );
}

export function computeConsistencyScore(
  findings: TemporalContradiction[],
  penaltyPerFinding = 5,
): number {
  if (findings.length === 0) return 100;
  return Math.max(0, 100 - findings.length * penaltyPerFinding);
}
