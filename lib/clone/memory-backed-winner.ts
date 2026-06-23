import type { RecalledMemory } from "@/lib/clone/recall-memories";
import {
  LOYALTY_CLAIM_RE,
  RIVAL_DISTRUST_RE,
  UNDERDOG_CLAIM_RE,
  matchInvolvesRef,
  teamMatchesName,
  teamMatchesRef,
  textMentionsTeam,
} from "@/lib/clone/team-matching";
import type { Match } from "@/lib/mock/types";
import { isUuid } from "@/lib/utils";

export type MemoryBackedPrior = {
  winner: string | null;
  confidence: "strong" | "weak" | "none";
  reason: string;
  supportingMemoryIds: string[];
  excerpt: string | null;
};

export type MemoryBackedProfile = {
  favorite_team?: string | null;
  rival_team?: string | null;
};

type PriorCandidate = {
  winner: string;
  weight: number;
  confidence: "strong" | "weak";
  reason: string;
  memoryIds: string[];
  excerpt: string;
};

function parseCorrectionWinner(text: string, match: Match): string | null {
  const pickMatch = text.match(/My pick:\s*([A-Za-z]{2,4})\b/i);
  if (!pickMatch?.[1] || !match.homeTeam || !match.awayTeam) return null;
  const code = pickMatch[1].toUpperCase();
  if (code === match.homeTeam.code) return match.homeTeam.code;
  if (code === match.awayTeam.code) return match.awayTeam.code;
  if (teamMatchesRef(match.homeTeam, pickMatch[1])) return match.homeTeam.code;
  if (teamMatchesRef(match.awayTeam, pickMatch[1])) return match.awayTeam.code;
  return null;
}

function profileFallbackWinner(
  match: Match,
  profile: MemoryBackedProfile,
): PriorCandidate | null {
  if (!match.homeTeam || !match.awayTeam) return null;

  const homeCode = match.homeTeam.code;
  const awayCode = match.awayTeam.code;
  const fav = profile.favorite_team;
  const rival = profile.rival_team;
  const homeName = match.homeTeam.name;
  const awayName = match.awayTeam.name;

  if (rival && teamMatchesName(homeName, rival)) {
    return {
      winner: awayCode,
      weight: 35,
      confidence: "weak",
      reason: `Profile rival ${rival} is playing at home — back the away side.`,
      memoryIds: [],
      excerpt: "",
    };
  }
  if (rival && teamMatchesName(awayName, rival)) {
    return {
      winner: homeCode,
      weight: 35,
      confidence: "weak",
      reason: `Profile rival ${rival} is playing away — back the home side.`,
      memoryIds: [],
      excerpt: "",
    };
  }
  if (fav && teamMatchesName(homeName, fav)) {
    return {
      winner: homeCode,
      weight: 30,
      confidence: "weak",
      reason: `Favorite ${fav} is at home.`,
      memoryIds: [],
      excerpt: "",
    };
  }
  if (fav && teamMatchesName(awayName, fav)) {
    return {
      winner: awayCode,
      weight: 30,
      confidence: "weak",
      reason: `Favorite ${fav} is away.`,
      memoryIds: [],
      excerpt: "",
    };
  }

  return null;
}

function underdogWinner(match: Match, favorite: string | null | undefined): string | null {
  if (!favorite || !match.homeTeam || !match.awayTeam) return null;
  if (!matchInvolvesRef(match, favorite)) return null;
  if (teamMatchesRef(match.homeTeam, favorite)) return match.awayTeam.code;
  if (teamMatchesRef(match.awayTeam, favorite)) return match.homeTeam.code;
  return null;
}

function memoryIds(memory: RecalledMemory): string[] {
  return memory.id && isUuid(memory.id) ? [memory.id] : [];
}

function scanMemorySignals(
  match: Match,
  recalledMemories: RecalledMemory[],
  profile: MemoryBackedProfile,
): PriorCandidate[] {
  if (!match.homeTeam || !match.awayTeam) return [];

  const candidates: PriorCandidate[] = [];
  const fav = profile.favorite_team;
  const rival = profile.rival_team;

  for (const memory of recalledMemories) {
    const ids = memoryIds(memory);
    const text = memory.text;
    const isFixtureCorrection =
      (memory.source === "clone_correction" || memory.type === "correction") &&
      (memory.metadataMatchId === match.id ||
        textMentionsTeam(text, match.homeTeam) ||
        textMentionsTeam(text, match.awayTeam));

    if (isFixtureCorrection) {
      const correctionWinner = parseCorrectionWinner(text, match);
      if (correctionWinner) {
        candidates.push({
          winner: correctionWinner,
          weight: memory.metadataMatchId === match.id ? 100 : 90,
          confidence: "strong",
          reason: "Clone correction for this fixture.",
          memoryIds: ids,
          excerpt: text.slice(0, 120),
        });
        continue;
      }
    }

    const isConsolidated =
      memory.type === "consolidated_bias" || memory.source === "sleep_cycle";
    if (
      isConsolidated &&
      (textMentionsTeam(text, match.homeTeam) ||
        textMentionsTeam(text, match.awayTeam) ||
        (fav && text.toLowerCase().includes(fav.toLowerCase())))
    ) {
      const favHome = fav && teamMatchesRef(match.homeTeam, fav);
      const favAway = fav && teamMatchesRef(match.awayTeam, fav);
      if (favHome || favAway) {
        candidates.push({
          winner: favHome ? match.homeTeam.code : match.awayTeam.code,
          weight: 80,
          confidence: "strong",
          reason: "Consolidated bias memory for this matchup.",
          memoryIds: ids,
          excerpt: text.slice(0, 120),
        });
      }
    }

    if (LOYALTY_CLAIM_RE.test(text) && fav && matchInvolvesRef(match, fav)) {
      const backsHome = teamMatchesRef(match.homeTeam, fav);
      const backsAway = teamMatchesRef(match.awayTeam, fav);
      if (
        (backsHome && textMentionsTeam(text, match.homeTeam)) ||
        (backsAway && textMentionsTeam(text, match.awayTeam)) ||
        text.toLowerCase().includes(fav.toLowerCase())
      ) {
        candidates.push({
          winner: backsHome ? match.homeTeam.code : match.awayTeam.code,
          weight: 75,
          confidence: "strong",
          reason: `Loyalty memory backs ${fav}.`,
          memoryIds: ids,
          excerpt: text.slice(0, 120),
        });
      }
    }

    if (RIVAL_DISTRUST_RE.test(text) && rival && matchInvolvesRef(match, rival)) {
      const rivalHome = teamMatchesRef(match.homeTeam, rival);
      const rivalAway = teamMatchesRef(match.awayTeam, rival);
      if (rivalHome || rivalAway) {
        candidates.push({
          winner: rivalHome ? match.awayTeam.code : match.homeTeam.code,
          weight: 75,
          confidence: "strong",
          reason: `Rival distrust — pick against ${rival}.`,
          memoryIds: ids,
          excerpt: text.slice(0, 120),
        });
      }
    }

    if (UNDERDOG_CLAIM_RE.test(text) && matchInvolvesRef(match, fav)) {
      const underdog = underdogWinner(match, fav);
      if (underdog) {
        candidates.push({
          winner: underdog,
          weight: 50,
          confidence: "weak",
          reason: "Underdog-backing memory — favor the non-favorite side.",
          memoryIds: ids,
          excerpt: text.slice(0, 120),
        });
      }
    }
  }

  const fallback = profileFallbackWinner(match, profile);
  if (fallback) candidates.push(fallback);

  return candidates;
}

export function inferMemoryBackedWinner(
  match: Match,
  recalledMemories: RecalledMemory[],
  profile: MemoryBackedProfile | null,
): MemoryBackedPrior {
  const prof = profile ?? {};
  const candidates = scanMemorySignals(match, recalledMemories, prof);

  if (candidates.length === 0) {
    return {
      winner: null,
      confidence: "none",
      reason: "",
      supportingMemoryIds: [],
      excerpt: null,
    };
  }

  const best = [...candidates].sort((a, b) => b.weight - a.weight)[0]!;

  return {
    winner: best.winner,
    confidence: best.confidence,
    reason: best.reason,
    supportingMemoryIds: best.memoryIds,
    excerpt: best.excerpt || null,
  };
}
