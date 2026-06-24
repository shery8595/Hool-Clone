import { memoryCountToMaturity } from "@/lib/auth/maturity";
import { buildCloneInsight } from "@/lib/clone/clone-insight";
import { huntContradictions } from "@/lib/clone/contradiction-hunter";
import {
  formatClonePick,
  pickShowcaseMatch,
  toRecalledMemories,
} from "@/lib/clone/clone-showcase";
import { fallbackClonePrediction } from "@/lib/clone/fallback-clone-prediction";
import {
  buildCloneKnowledgeSnapshot,
} from "@/lib/stats/clone-analytics";
import {
  detectTemporalContradictions,
} from "@/lib/clone/temporal-contradictions";
import type {
  MemoryTimeMachine,
  TimeMachinePhaseId,
  TimeMachineReceipt,
  TimeMachineSnapshot,
} from "@/lib/clone/memory-time-machine-types";
import type { ClonePredictionEntry } from "@/lib/db/clone-predictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import type { DriverChip, Match } from "@/lib/mock/types";
import { formatProvenanceLabel } from "@/lib/clone/memory-provenance";
import { isPlaceholderBlobId } from "@/lib/walrus/fetch-blob";

const DAY3_MEMORY_CAP = 3;
const DAY4_MEMORY_CAP = 10;
const DAY7_MEMORY_CAP = 8;

function teamInMatch(
  teamName: string | null | undefined,
  match: Match,
): boolean {
  if (!teamName || !match.homeTeam || !match.awayTeam) return false;
  const needle = teamName.toLowerCase();
  return (
    match.homeTeam.name.toLowerCase().includes(needle) ||
    match.awayTeam.name.toLowerCase().includes(needle) ||
    needle.includes(match.homeTeam.name.toLowerCase().slice(0, 4))
  );
}

function memoriesToReceipts(
  memories: StoredMemory[],
  walrusBacked = false,
): TimeMachineReceipt[] {
  return memories.map((m) => {
    const blobId =
      typeof m.metadata?.walrusBlobId === "string"
        ? m.metadata.walrusBlobId
        : typeof m.metadata?.blobId === "string"
          ? m.metadata.blobId
          : undefined;
    const source =
      typeof m.metadata?.source === "string" ? m.metadata.source : m.type;
    const hasRealBlob =
      Boolean(blobId) && !isPlaceholderBlobId(blobId ?? "");
    const backed =
      walrusBacked &&
      (m.storageStatus === "stored" || hasRealBlob);

    return {
      summary: m.text,
      strength: backed ? ("high" as const) : ("medium" as const),
      walrusBacked: backed,
      memoryId: m.id,
      walrusBlobId: hasRealBlob ? blobId : undefined,
      provenanceLabel:
        formatProvenanceLabel(source, m.createdAt) ?? undefined,
    };
  });
}

function cloneReceiptsToTimeMachine(
  receipts: ClonePredictionEntry["clone"]["receipts"],
): TimeMachineReceipt[] {
  return (receipts ?? []).map((r) => ({
    summary: r.text,
    strength: "high" as const,
    walrusBacked: Boolean(
      r.walrusBlobId &&
        !isPlaceholderBlobId(r.walrusBlobId) &&
        r.storageStatus === "stored",
    ),
    memoryId: r.id.startsWith("receipt-") ? undefined : r.id,
    walrusBlobId:
      r.walrusBlobId && !isPlaceholderBlobId(r.walrusBlobId)
        ? r.walrusBlobId
        : undefined,
    provenanceLabel: r.provenanceLabel,
  }));
}

function buildDay3Reasoning(
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style"
  > | null,
  memories: StoredMemory[],
  match: Match,
): string {
  const hints: string[] = [];

  if (profile?.favorite_team) {
    hints.push(`you bleed ${profile.favorite_team}`);
  }
  if (profile?.rival_team) {
    hints.push(`you never trust ${profile.rival_team}`);
  }
  if (profile?.preferred_style) {
    hints.push(`you pick with ${profile.preferred_style}`);
  }
  if (teamInMatch(profile?.rival_team, match)) {
    hints.push(`this fixture triggers your rival grudge`);
  }

  const memoryLine = memories[0]
    ? `I remember: "${memories[0].text.slice(0, 100)}${memories[0].text.length > 100 ? "…" : ""}"`
    : null;

  const base =
    hints.length > 0
      ? `Early memories are forming — ${hints.join(", ")}.`
      : "A few training answers are shaping how I read you.";

  return memoryLine ? `${base} ${memoryLine}` : base;
}

function buildDay7Reasoning(input: {
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style" | "summary"
  > | null;
  memories: StoredMemory[];
  match: Match;
  cloneEntry: ClonePredictionEntry | null;
  historyItem: PredictionHistoryItem | null;
  history: PredictionHistoryItem[];
  memoryDrivers: DriverChip[];
  winner: string;
  homeScore: number;
  awayScore: number;
}): string {
  const hunted = huntContradictions({
    profile: input.profile,
    history: input.history,
    memoryDrivers: input.memoryDrivers,
    memoryTexts: input.memories.map((m) => m.text),
  })[0];

  if (input.cloneEntry) {
    const clone = input.cloneEntry.clone;
    const insight =
      clone.insight ??
      input.cloneEntry.insight ??
      (input.historyItem
        ? buildCloneInsight({
            human: input.historyItem.prediction,
            cloneWinner: clone.winner,
            cloneHomeScore: clone.homeScore,
            cloneAwayScore: clone.awayScore,
            match: input.match,
            rivalTeam: input.profile?.rival_team,
          })
        : undefined);

    if (hunted) return hunted.text;
    if (insight) return insight;
    if (clone.reasoning) return clone.reasoning;
  }

  const roast: string[] = [];
  if (hunted) {
    roast.push(hunted.text);
  }
  roast.push(
    `I've got ${input.memories.length} Walrus-backed receipts on your football brain now.`,
  );

  if (
    input.profile?.rival_team &&
    teamInMatch(input.profile.rival_team, input.match)
  ) {
    roast.push(
      `Classic you — ${input.profile.rival_team} is in this match and your history says you fade them until they hurt you.`,
    );
  }

  if (input.profile?.preferred_style?.toLowerCase().includes("vibes")) {
    roast.push(
      `You talk stats but your receipts scream vibes — I'm not copying a safe pick just to agree.`,
    );
  }

  const contradiction = input.memories.find((m) =>
    m.text.toLowerCase().includes("contradict"),
  );
  if (contradiction) {
    roast.push(`Receipt flagged a contradiction: "${contradiction.text.slice(0, 90)}…"`);
  } else if (input.memories[0]) {
    roast.push(`Citing memory: "${input.memories[0].text.slice(0, 90)}…"`);
  }

  return roast.join(" ");
}

function snapshotFromFallback(
  phase: TimeMachinePhaseId,
  input: {
    match: Match;
    memories: StoredMemory[];
    memoriesCount: number;
    profile: Pick<
      DbFanProfile,
      "favorite_team" | "rival_team" | "preferred_style" | "summary"
    > | null;
    useProfileHints: boolean;
    cloneEntry: ClonePredictionEntry | null;
    historyItem: PredictionHistoryItem | null;
    history: PredictionHistoryItem[];
    memoryDrivers: DriverChip[];
  },
): Omit<
  TimeMachineSnapshot,
  "id" | "dayLabel" | "title" | "subtitle" | "traits" | "knowledgeBullets"
> {
  const home = input.match.homeTeam!;
  const away = input.match.awayTeam!;
  const recalled = toRecalledMemories(input.memories);

  const output = fallbackClonePrediction({
    match: input.match,
    recalledMemories: recalled,
    memoriesCount: input.memoriesCount,
    favoriteTeam: input.useProfileHints ? input.profile?.favorite_team : null,
    rivalTeam: input.useProfileHints ? input.profile?.rival_team : null,
  });

  let reasoning = output.reasoning;
  let confidence = output.confidence;
  let winner = output.predictedWinner;
  let homeScore = output.predictedScore.teamA;
  let awayScore = output.predictedScore.teamB;
  let receipts: TimeMachineReceipt[] = output.memoryReceipts.map((r) => ({
    summary: r.summary,
    strength: r.strength,
    walrusBacked: false,
  }));

  if (phase === "day3") {
    reasoning = buildDay3Reasoning(input.profile, input.memories, input.match);
    confidence = Math.min(48, output.confidence + 8);
    receipts = memoriesToReceipts(input.memories.slice(0, DAY3_MEMORY_CAP));
  }

  if (phase === "day4") {
    reasoning = buildDay3Reasoning(input.profile, input.memories, input.match);
    confidence = Math.min(72, 52 + input.memories.length * 3);
    receipts = memoriesToReceipts(input.memories, true);
  }

  if (phase === "day7") {
    if (input.cloneEntry) {
      const clone = input.cloneEntry.clone;
      winner = clone.winner;
      homeScore = clone.homeScore;
      awayScore = clone.awayScore;
      confidence = clone.confidence;
      receipts =
        cloneReceiptsToTimeMachine(clone.receipts).length > 0
          ? cloneReceiptsToTimeMachine(clone.receipts)
          : memoriesToReceipts(input.memories, true);
    } else {
      confidence = Math.min(78, 52 + input.memories.length * 3);
      receipts = memoriesToReceipts(input.memories, true);
    }
    reasoning = buildDay7Reasoning({
      profile: input.profile,
      memories: input.memories,
      match: input.match,
      cloneEntry: input.cloneEntry,
      historyItem: input.historyItem,
      history: input.history,
      memoryDrivers: input.memoryDrivers,
      winner,
      homeScore,
      awayScore,
    });
  }

  const maturity = memoryCountToMaturity(input.memoriesCount);

  return {
    memoryCount: input.memoriesCount,
    maturityLabel: maturity.label,
    prediction: formatClonePick(winner, homeScore, awayScore, home, away),
    reasoning,
    confidence,
    receipts,
  };
}

const PHASE_META: Record<
  TimeMachinePhaseId,
  { dayLabel: string; title: string; subtitle: string; traits: string[] }
> = {
  day1: {
    dayLabel: "Day 1",
    title: "Stranger clone",
    subtitle: "Barely knows the user — generic, low-confidence guesses.",
    traits: ["Generic guess", "Low confidence", "No receipts"],
  },
  day3: {
    dayLabel: "Day 3",
    title: "Learner clone",
    subtitle: "Remembers favorite teams, rival grudges, and prediction style.",
    traits: ["Team loyalty", "Rival grudges", "Style bias"],
  },
  day4: {
    dayLabel: "Day 4",
    title: "Imitator clone",
    subtitle: "Knows your teams, rivals, and prediction patterns — cites memories.",
    traits: ["Team loyalty", "Rival hatred", "Prediction history"],
  },
  day7: {
    dayLabel: "Day 7",
    title: "Contradiction hunter",
    subtitle:
      "Catches contradictions, predicts behavior, roasts patterns — cites Walrus receipts.",
    traits: ["Pattern roast", "Clone disagrees", "Walrus receipts"],
  },
};

export function buildMemoryTimeMachine(input: {
  joinedAt: Date;
  memoriesCount: number;
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style" | "summary"
  > | null;
  history: PredictionHistoryItem[];
  cloneByMatchId: Map<string, ClonePredictionEntry>;
  matches: Match[];
  chronologicalMemories: StoredMemory[];
  memoryDrivers: DriverChip[];
  preferredMatchId?: string;
}): MemoryTimeMachine | null {
  const picked = pickShowcaseMatch(input);
  if (!picked?.match.homeTeam || !picked.match.awayTeam) return null;

  const { match, cloneEntry, historyItem } = picked;
  const home = match.homeTeam!;
  const away = match.awayTeam!;

  const snapshotBase = {
    match,
    profile: input.profile,
    history: input.history,
    memoryDrivers: input.memoryDrivers,
  };

  const day1 = snapshotFromFallback("day1", {
    ...snapshotBase,
    memories: [],
    memoriesCount: 0,
    useProfileHints: false,
    cloneEntry: null,
    historyItem: null,
  });

  const day3Memories = input.chronologicalMemories.slice(0, DAY3_MEMORY_CAP);
  const day3 = snapshotFromFallback("day3", {
    ...snapshotBase,
    memories: day3Memories,
    memoriesCount: Math.max(day3Memories.length, DAY3_MEMORY_CAP),
    useProfileHints: true,
    cloneEntry: null,
    historyItem: null,
  });

  const day4Memories = input.chronologicalMemories.slice(0, DAY4_MEMORY_CAP);
  const day4 = snapshotFromFallback("day4", {
    ...snapshotBase,
    memories: day4Memories,
    memoriesCount: Math.max(day4Memories.length, 6),
    useProfileHints: true,
    cloneEntry: cloneEntry ?? null,
    historyItem: historyItem ?? null,
  });

  const day7Memories = input.chronologicalMemories.slice(0, DAY7_MEMORY_CAP);
  const day7 = snapshotFromFallback("day7", {
    ...snapshotBase,
    memories: day7Memories,
    memoriesCount: Math.max(input.memoriesCount, 7),
    useProfileHints: true,
    cloneEntry,
    historyItem,
  });

  const temporalContradictions = detectTemporalContradictions(
    input.chronologicalMemories,
  );
  const behavioralContradictionCount = huntContradictions({
    profile: input.profile,
    history: input.history,
    memoryDrivers: input.memoryDrivers,
    memoryTexts: input.chronologicalMemories.map((m) => m.text),
  }).length;

  const knowledgeByDay = {
    day1: buildCloneKnowledgeSnapshot(1, {
      joinedAt: input.joinedAt,
      memories: input.chronologicalMemories,
      profile: input.profile,
      history: input.history,
      temporalContradictions,
      behavioralContradictionCount,
    }),
    day3: buildCloneKnowledgeSnapshot(3, {
      joinedAt: input.joinedAt,
      memories: input.chronologicalMemories,
      profile: input.profile,
      history: input.history,
      temporalContradictions,
      behavioralContradictionCount,
    }),
    day4: buildCloneKnowledgeSnapshot(4, {
      joinedAt: input.joinedAt,
      memories: input.chronologicalMemories,
      profile: input.profile,
      history: input.history,
      temporalContradictions,
      behavioralContradictionCount,
    }),
    day7: buildCloneKnowledgeSnapshot(7, {
      joinedAt: input.joinedAt,
      memories: input.chronologicalMemories,
      profile: input.profile,
      history: input.history,
      temporalContradictions,
      behavioralContradictionCount,
    }),
  };

  const phases: TimeMachineSnapshot[] = (
    ["day1", "day3", "day4", "day7"] as const
  ).map((id) => {
    const meta = PHASE_META[id];
    const body =
      id === "day1"
        ? day1
        : id === "day3"
          ? day3
          : id === "day4"
            ? day4
            : day7;
    const knowledge = knowledgeByDay[id];
    return {
      id,
      dayLabel: meta.dayLabel,
      title: meta.title,
      subtitle: meta.subtitle,
      traits: meta.traits,
      ...body,
      confidence: knowledge.confidence,
      knowledgeBullets: knowledge.bullets,
      maturityLabel: knowledge.maturityLabel,
    };
  });

  const defaultPhase: TimeMachinePhaseId =
    input.memoriesCount >= 7
      ? "day7"
      : input.memoriesCount >= 6
        ? "day4"
        : input.memoriesCount >= 3
          ? "day3"
          : "day1";

  return {
    matchId: match.id,
    matchLabel: `${home.name} vs ${away.name}`,
    phases,
    actualMemoriesCount: input.memoriesCount,
    defaultPhase,
  };
}
