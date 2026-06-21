import type { Match } from "@/lib/mock/types";
import type { RecalledMemory } from "@/lib/clone/recall-memories";
import { isCurrentMatchSubmittedPick } from "@/lib/clone/prediction-memory-filter";

const RRF_K = 60;

export type RankedMemory = RecalledMemory & {
  rrfScore: number;
  finalScore: number;
  createdAt?: string;
  source?: string;
};

type TypeDecayConfig = {
  weight: number;
  halfLifeDays: number;
};

const TYPE_CONFIG: Record<string, TypeDecayConfig> = {
  correction: { weight: 1.5, halfLifeDays: 90 },
  prediction_history_summary: { weight: 1.35, halfLifeDays: 45 },
  prediction_pattern: { weight: 1.3, halfLifeDays: 45 },
  fan_profile: { weight: 1.0, halfLifeDays: 180 },
  bias: { weight: 1.05, halfLifeDays: 120 },
  emotional_memory: { weight: 1.1, halfLifeDays: 60 },
  remembered: { weight: 0.95, halfLifeDays: 30 },
};

const SOURCE_BOOST: Record<string, number> = {
  clone_correction: 0.08,
  debate: 0.06,
  prediction_submit: 0.1,
  telegram_post_match: 0.05,
  telegram_live_goal: 0.05,
  match_resolution: 0.12,
  onboarding: 0.02,
};

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function typeConfig(memory: RecalledMemory): TypeDecayConfig {
  const type = memory.type ?? "remembered";
  return TYPE_CONFIG[type] ?? { weight: 1.0, halfLifeDays: 60 };
}

export function typeWeight(memory: RecalledMemory): number {
  const config = typeConfig(memory);
  const sourceBoost = memory.source ? (SOURCE_BOOST[memory.source] ?? 0) : 0;
  return config.weight + sourceBoost;
}

export function recencyBoost(memory: RecalledMemory): number {
  if (!memory.createdAt) return 0;
  const config = typeConfig(memory);
  const ageMs = Date.now() - new Date(memory.createdAt).getTime();
  const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  const decay = Math.pow(0.5, ageDays / config.halfLifeDays);
  return decay * 0.15;
}

export function entityOverlapBoost(memory: RecalledMemory, match: Match): number {
  if (!match.homeTeam || !match.awayTeam) return 0;
  const haystack = memory.text.toLowerCase();
  let boost = 0;
  const entities = [
    match.homeTeam.name,
    match.awayTeam.name,
    match.homeTeam.code,
    match.awayTeam.code,
  ];
  for (const entity of entities) {
    if (haystack.includes(entity.toLowerCase())) boost += 0.04;
  }
  if (memory.metadataMatchId === match.id) boost += 0.12;
  return boost;
}

export function reciprocalRankFusion(
  rankedLists: RecalledMemory[][],
): Map<string, RankedMemory> {
  const byKey = new Map<string, RankedMemory>();

  for (const list of rankedLists) {
    list.forEach((memory, index) => {
      const key = memory.id ?? memory.text;
      const contribution = 1 / (RRF_K + index + 1);
      const existing = byKey.get(key);

      if (existing) {
        existing.rrfScore += contribution;
        existing.score = Math.max(existing.score, memory.score);
      } else {
        byKey.set(key, {
          ...memory,
          rrfScore: contribution,
          finalScore: 0,
        });
      }
    });
  }

  return byKey;
}

export type RerankMemoriesOptions = {
  liveMatchId?: string;
  excludeCurrentMatchPick?: boolean;
};

function liveContextBoost(
  memory: RecalledMemory,
  liveMatchId?: string,
  excludeCurrentMatchPick?: boolean,
): number {
  if (!liveMatchId || memory.metadataMatchId !== liveMatchId) return 0;
  if (excludeCurrentMatchPick && isCurrentMatchSubmittedPick(memory, liveMatchId)) {
    return 0;
  }
  if (
    memory.source === "prediction_submit" ||
    memory.source === "prediction_pattern"
  ) {
    return 0.15;
  }
  return 0;
}

export function rerankMemoriesForMatch(
  memories: RankedMemory[],
  match: Match,
  options: RerankMemoriesOptions = {},
): RankedMemory[] {
  return memories
    .map((memory) => {
      const finalScore =
        memory.rrfScore * typeWeight(memory) +
        recencyBoost(memory) +
        entityOverlapBoost(memory, match) +
        liveContextBoost(
          memory,
          options.liveMatchId,
          options.excludeCurrentMatchPick,
        ) +
        memory.score * 0.05;

      return { ...memory, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

export function selectDiverseMemories(
  ranked: RankedMemory[],
  limit = 8,
): RankedMemory[] {
  const selected: RankedMemory[] = [];
  const selectedTokens: Set<string>[] = [];
  const seenTypes = new Set<string>();

  for (const memory of ranked) {
    if (selected.length >= limit) break;

    const tokens = tokenize(memory.text);
    const isDuplicate = selectedTokens.some(
      (existing) => jaccardSimilarity(existing, tokens) > 0.72,
    );

    if (isDuplicate && selected.length > 0) continue;

    const type = memory.type ?? "remembered";
    const typeCount = [...seenTypes].filter((t) => t === type).length;
    if (typeCount >= 3 && selected.length >= 3) continue;

    selected.push(memory);
    selectedTokens.push(tokens);
    seenTypes.add(type);
  }

  if (selected.length < limit) {
    for (const memory of ranked) {
      if (selected.length >= limit) break;
      if (selected.some((m) => (m.id ?? m.text) === (memory.id ?? memory.text))) {
        continue;
      }
      selected.push(memory);
    }
  }

  return selected;
}
