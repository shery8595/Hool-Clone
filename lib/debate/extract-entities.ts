import type { MemoryReceipt } from "@/lib/mock/types";

export const KNOWN_ENTITIES = [
  "belgium",
  "portugal",
  "england",
  "brazil",
  "france",
  "argentina",
  "haiti",
  "scotland",
  "uzbekistan",
  "iraq",
  "saudi arabia",
  "mexico",
  "korea",
  "south africa",
  "czechia",
  "croatia",
  "germany",
  "spain",
  "italy",
  "netherlands",
  "morocco",
  "egypt",
  "australia",
  "turkey",
  "turkiye",
  "usa",
  "world cup",
];

const PLAYER_ALIASES: Array<{ pattern: RegExp; terms: string[] }> = [
  { pattern: /\bmessi\b/i, terms: ["messi", "argentina"] },
  {
    pattern: /\b(kevin\s+)?de\s*bruyne\b|\bde\s*bryne\b|\bkdb\b/i,
    terms: ["de bruyne", "de bryne", "kevin", "belgium"],
  },
  {
    pattern: /\bcourtois\b|\bcurtois\b/i,
    terms: ["courtois", "curtois", "belgium"],
  },
  {
    pattern: /\bronaldo\b|\bcristiano\b/i,
    terms: ["ronaldo", "cristiano", "portugal"],
  },
];

export function isCorrectionReceipt(receipt: MemoryReceipt): boolean {
  return receipt.text.toLowerCase().startsWith("correction:");
}

export function receiptMentionsEntity(
  receipt: MemoryReceipt,
  entity: string,
): boolean {
  return receipt.text.toLowerCase().includes(entity.toLowerCase());
}

export function receiptMatchesSearchTerm(
  receipt: MemoryReceipt,
  term: string,
): boolean {
  return receipt.text.toLowerCase().includes(term.toLowerCase());
}

export function extractSearchTerms(
  message: string,
  hints: {
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
    memoryTexts?: string[];
  },
): string[] {
  const lower = message.toLowerCase();
  const terms = new Set<string>();

  for (const team of [hints.favoriteTeam, hints.rivalTeam]) {
    if (!team) continue;
    const t = team.toLowerCase();
    if (lower.includes(t)) terms.add(t);
  }

  if (/\b(despise|hate most|loathe|worst team|never trust)\b/i.test(message)) {
    if (hints.rivalTeam) terms.add(hints.rivalTeam.toLowerCase());
  }

  for (const entity of KNOWN_ENTITIES) {
    if (lower.includes(entity)) terms.add(entity);
  }

  for (const { pattern, terms: aliasTerms } of PLAYER_ALIASES) {
    if (pattern.test(message)) {
      for (const term of aliasTerms) terms.add(term);
    }
  }

  for (const text of hints.memoryTexts ?? []) {
    const textLower = text.toLowerCase();
    for (const entity of KNOWN_ENTITIES) {
      if (textLower.includes(entity) && lower.includes(entity)) {
        terms.add(entity);
      }
    }
    for (const { pattern, terms: aliasTerms } of PLAYER_ALIASES) {
      if (pattern.test(message)) {
        for (const term of aliasTerms) {
          if (textLower.includes(term)) terms.add(term);
        }
      }
    }
  }

  return [...terms];
}

export function extractDebateEntities(
  message: string,
  hints: {
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
    memoryTexts?: string[];
  },
): string[] {
  return extractSearchTerms(message, hints);
}

export function scoreReceiptSearchTerms(
  receipt: MemoryReceipt,
  searchTerms: string[],
): number {
  if (searchTerms.length === 0) return 0;

  let score = 0;
  const hay = receipt.text.toLowerCase();

  for (const term of searchTerms) {
    const needle = term.toLowerCase();
    if (!hay.includes(needle)) continue;
    score += needle.length >= 6 ? 18 : 12;
    if (isCorrectionReceipt(receipt) && hay.includes("match:")) {
      score += 6;
    }
  }

  return score;
}

export function pickReceiptsBySearchTerms(
  catalog: MemoryReceipt[],
  searchTerms: string[],
  options?: {
    includeCorrections?: boolean;
    limit?: number;
    minScore?: number;
  },
): MemoryReceipt[] {
  if (searchTerms.length === 0) return [];

  const includeCorrections = options?.includeCorrections ?? true;
  const limit = options?.limit ?? 2;
  const minScore = options?.minScore ?? 12;

  const scored = catalog
    .filter((receipt) => includeCorrections || !isCorrectionReceipt(receipt))
    .map((receipt) => ({
      receipt,
      score: scoreReceiptSearchTerms(receipt, searchTerms),
    }))
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.receipt);
}

export function pickEntityReceipts(
  catalog: MemoryReceipt[],
  entities: string[],
  options?: { excludeCorrections?: boolean; limit?: number },
): MemoryReceipt[] {
  return pickReceiptsBySearchTerms(catalog, entities, {
    includeCorrections: !options?.excludeCorrections,
    limit: options?.limit ?? 3,
    minScore: 12,
  });
}

export function receiptsMatchSearchTerms(
  receipts: MemoryReceipt[],
  searchTerms: string[],
): boolean {
  if (searchTerms.length === 0) return receipts.length > 0;
  return receipts.some((receipt) =>
    searchTerms.some((term) => receiptMatchesSearchTerm(receipt, term)),
  );
}
