import type { ClonePredictionEntry } from "@/lib/db/clone-predictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { BiasAxis, DriverChip, Match, Team } from "@/lib/mock/types";

function clampScore(value: number): number {
  return Math.min(10, Math.max(1, Math.round(value * 10) / 10));
}

function teamMatchesRef(team: Team, ref: string | null | undefined): boolean {
  if (!ref) return false;
  const needle = ref.toLowerCase();
  const code = team.code.toLowerCase();
  const name = team.name.toLowerCase();
  return (
    code === needle ||
    name.includes(needle) ||
    needle.includes(name) ||
    needle.includes(code)
  );
}

function matchInvolvesRef(match: Match, ref: string | null | undefined): boolean {
  if (!ref || !match.homeTeam || !match.awayTeam) return false;
  return (
    teamMatchesRef(match.homeTeam, ref) || teamMatchesRef(match.awayTeam, ref)
  );
}

function winnerTeam(match: Match, winnerCode: string): Team | null {
  if (!match.homeTeam || !match.awayTeam) return null;
  if (winnerCode === match.homeTeam.code) return match.homeTeam;
  if (winnerCode === match.awayTeam.code) return match.awayTeam;
  return null;
}

function pickedFavorite(
  match: Match,
  winnerCode: string,
  favorite: string | null | undefined,
): boolean | null {
  if (!favorite || !match.homeTeam || !match.awayTeam) return null;
  if (!matchInvolvesRef(match, favorite)) return null;
  const winner = winnerTeam(match, winnerCode);
  if (!winner) return null;
  return teamMatchesRef(winner, favorite);
}

function pickedAgainstRival(
  match: Match,
  winnerCode: string,
  rival: string | null | undefined,
): boolean | null {
  if (!rival || !match.homeTeam || !match.awayTeam) return null;
  if (!matchInvolvesRef(match, rival)) return null;
  const winner = winnerTeam(match, winnerCode);
  if (!winner) return null;
  return !teamMatchesRef(winner, rival);
}

function rateToScore(rate: number, baseline = 5): number {
  return clampScore(baseline + rate * 5);
}

function driverRate(drivers: DriverChip[], target: DriverChip): number {
  if (drivers.length === 0) return 0;
  return drivers.filter((d) => d === target).length / drivers.length;
}

function profileStyleScore(
  style: string | null | undefined,
  target: string,
): number {
  if (!style) return 5;
  return style.toLowerCase().includes(target) ? 8 : 4;
}

export type BuildBiasRadarInput = {
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style"
  > | null;
  memoriesCount: number;
  history: PredictionHistoryItem[];
  cloneByMatchId: Map<string, ClonePredictionEntry>;
  memoryDrivers: DriverChip[];
};

function measureHumanAxes(input: BuildBiasRadarInput) {
  const { profile, history, memoryDrivers } = input;
  const favorite = profile?.favorite_team ?? null;
  const rival = profile?.rival_team ?? null;

  const loyaltySamples: boolean[] = [];
  const rivalrySamples: boolean[] = [];
  const rivalryEmotionSamples: boolean[] = [];
  const underdogSamples: boolean[] = [];
  const confidences: number[] = [];
  const chaosSamples: number[] = [];
  const starSamples: number[] = [];

  for (const { match, prediction } of history) {
    if (!match.homeTeam || !match.awayTeam) continue;

    const favPick = pickedFavorite(match, prediction.winner, favorite);
    if (favPick !== null) loyaltySamples.push(favPick);

    const antiRival = pickedAgainstRival(match, prediction.winner, rival);
    if (antiRival !== null) {
      rivalrySamples.push(antiRival);
      rivalryEmotionSamples.push(
        prediction.emotion === "hyped" || prediction.emotion === "nervous",
      );
    }

    const favoriteInMatch = matchInvolvesRef(match, favorite);
    const lowConfidence = prediction.confidence <= 55;
    if (!favoriteInMatch && lowConfidence) {
      underdogSamples.push(true);
    } else if (favoriteInMatch && favPick === false) {
      underdogSamples.push(true);
    } else if (!favoriteInMatch) {
      underdogSamples.push(false);
    }

    confidences.push(prediction.confidence);

    const goalSwing = Math.abs(prediction.homeScore - prediction.awayScore);
    const chaosSignal =
      (prediction.emotion === "hyped" ? 0.45 : 0) +
      (goalSwing >= 3 ? 0.35 : 0) +
      (prediction.confidence <= 50 ? 0.2 : 0);
    chaosSamples.push(chaosSignal);

    const starSignal =
      (prediction.confidence >= 70 ? 0.3 : 0) +
      (prediction.homeScore + prediction.awayScore >= 4 ? 0.35 : 0) +
      (prediction.reasoning?.toLowerCase().includes("star") ? 0.35 : 0);
    starSamples.push(starSignal);
  }

  const loyaltyRate =
    loyaltySamples.length > 0
      ? loyaltySamples.filter(Boolean).length / loyaltySamples.length
      : null;
  const rivalryRate =
    rivalrySamples.length > 0
      ? rivalrySamples.filter(Boolean).length / rivalrySamples.length
      : null;
  const rivalryEmotionRate =
    rivalryEmotionSamples.length > 0
      ? rivalryEmotionSamples.filter(Boolean).length /
        rivalryEmotionSamples.length
      : null;
  const underdogRate =
    underdogSamples.length > 0
      ? underdogSamples.filter(Boolean).length / underdogSamples.length
      : null;
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : null;
  const chaosRate =
    chaosSamples.length > 0
      ? chaosSamples.reduce((a, b) => a + b, 0) / chaosSamples.length
      : null;
  const starRate =
    starSamples.length > 0
      ? starSamples.reduce((a, b) => a + b, 0) / starSamples.length
      : null;

  const memoryLoyaltyBoost = clampScore(5 + input.memoriesCount * 0.08);
  const driverChaos = driverRate(memoryDrivers, "chaos");
  const driverVibes = driverRate(memoryDrivers, "vibes");
  const driverStats = driverRate(memoryDrivers, "stats");
  const driverLoyalty = driverRate(memoryDrivers, "loyalty");

  return {
    loyalty: clampScore(
      loyaltyRate !== null
        ? rateToScore(loyaltyRate, 4)
        : favorite
          ? 6.5 + driverLoyalty * 2
          : memoryLoyaltyBoost,
    ),
    underdog: clampScore(
      underdogRate !== null
        ? rateToScore(underdogRate, 3.5)
        : 4 + driverVibes * 4 + (profileStyleScore(profile?.preferred_style, "vibes") - 5) * 0.4,
    ),
    confidence: clampScore(
      avgConfidence !== null ? avgConfidence / 10 : 5,
    ),
    chaos: clampScore(
      chaosRate !== null
        ? 3.5 + chaosRate * 6.5
        : 4 + driverChaos * 5 + (profileStyleScore(profile?.preferred_style, "chaos") - 5) * 0.5,
    ),
    starPlayer: clampScore(
      starRate !== null
        ? 3.5 + starRate * 6
        : 4.5 + driverStats * 4.5,
    ),
    rivalry: clampScore(
      rivalryRate !== null
        ? rateToScore(rivalryRate, 4) +
            (rivalryEmotionRate ?? 0) * 1.5
        : rival
          ? 7.5
          : 4.5,
    ),
  };
}

function measureCloneAxes(input: BuildBiasRadarInput) {
  const { profile, history, cloneByMatchId } = input;
  const favorite = profile?.favorite_team ?? null;
  const rival = profile?.rival_team ?? null;

  const loyaltySamples: boolean[] = [];
  const rivalrySamples: boolean[] = [];
  const underdogSamples: boolean[] = [];
  const confidences: number[] = [];
  const chaosSamples: number[] = [];
  const starSamples: number[] = [];
  const driftSamples: number[] = [];

  for (const { match, prediction } of history) {
    const cloneEntry = cloneByMatchId.get(match.id);
    if (!cloneEntry || !match.homeTeam || !match.awayTeam) continue;

    const clone = cloneEntry.clone;

    const favPick = pickedFavorite(match, clone.winner, favorite);
    if (favPick !== null) loyaltySamples.push(favPick);

    const antiRival = pickedAgainstRival(match, clone.winner, rival);
    if (antiRival !== null) rivalrySamples.push(antiRival);

    const humanFav = pickedFavorite(match, prediction.winner, favorite);
    const cloneFav = pickedFavorite(match, clone.winner, favorite);
    if (humanFav !== null && cloneFav !== null && humanFav !== cloneFav) {
      driftSamples.push(1);
    }

    const lowConfidence = clone.confidence <= 55;
    const favoriteInMatch = matchInvolvesRef(match, favorite);
    if (!favoriteInMatch && lowConfidence) {
      underdogSamples.push(true);
    } else if (favoriteInMatch && cloneFav === false) {
      underdogSamples.push(true);
    } else {
      underdogSamples.push(false);
    }

    confidences.push(clone.confidence);

    const goalSwing = Math.abs(clone.homeScore - clone.awayScore);
    const disagrees =
      prediction.winner !== clone.winner ||
      prediction.homeScore !== clone.homeScore ||
      prediction.awayScore !== clone.awayScore;
    chaosSamples.push(
      (disagrees ? 0.5 : 0.1) + (goalSwing >= 3 ? 0.25 : 0),
    );

    const receiptBoost = Math.min(0.4, (clone.receipts?.length ?? 0) * 0.1);
    starSamples.push(
      (clone.confidence >= 65 ? 0.35 : 0.15) + receiptBoost,
    );
  }

  const cloneCount = confidences.length;
  const humanAxes = measureHumanAxes(input);

  if (cloneCount === 0) {
    return {
      loyalty: humanAxes.loyalty,
      underdog: humanAxes.underdog,
      confidence: humanAxes.confidence,
      chaos: humanAxes.chaos,
      starPlayer: humanAxes.starPlayer,
      rivalry: humanAxes.rivalry,
      isEstimated: true,
    };
  }

  const loyaltyRate =
    loyaltySamples.length > 0
      ? loyaltySamples.filter(Boolean).length / loyaltySamples.length
      : 0.5;
  const rivalryRate =
    rivalrySamples.length > 0
      ? rivalrySamples.filter(Boolean).length / rivalrySamples.length
      : 0.5;
  const underdogRate =
    underdogSamples.length > 0
      ? underdogSamples.filter(Boolean).length / underdogSamples.length
      : 0.35;
  const avgConfidence =
    confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const chaosRate =
    chaosSamples.reduce((a, b) => a + b, 0) / chaosSamples.length;
  const starRate = starSamples.reduce((a, b) => a + b, 0) / starSamples.length;
  const driftRate =
    driftSamples.length > 0
      ? driftSamples.reduce((a, b) => a + b, 0) / driftSamples.length
      : 0;

  return {
    loyalty: rateToScore(loyaltyRate, 4),
    underdog: clampScore(rateToScore(underdogRate, 3.5) + driftRate * 1.5),
    confidence: clampScore(avgConfidence / 10),
    chaos: clampScore(3.5 + chaosRate * 6),
    starPlayer: clampScore(3.5 + starRate * 6),
    rivalry: rateToScore(rivalryRate, 4),
    isEstimated: false,
  };
}

export function hasBiasRadarData(input: BuildBiasRadarInput): boolean {
  return (
    input.history.length > 0 ||
    input.memoriesCount > 0 ||
    Boolean(input.profile?.favorite_team) ||
    Boolean(input.profile?.rival_team) ||
    input.memoryDrivers.length > 0
  );
}

export function buildBiasRadar(input: BuildBiasRadarInput): BiasAxis[] {
  const you = measureHumanAxes(input);
  const clone = measureCloneAxes(input);

  return [
    { label: "Loyalty", you: you.loyalty, clone: clone.loyalty },
    { label: "Underdog bias", you: you.underdog, clone: clone.underdog },
    { label: "Confidence", you: you.confidence, clone: clone.confidence },
    { label: "Chaos appetite", you: you.chaos, clone: clone.chaos },
    {
      label: "Star-player bias",
      you: you.starPlayer,
      clone: clone.starPlayer,
    },
    { label: "Rivalry emotion", you: you.rivalry, clone: clone.rivalry },
  ];
}

export function extractMemoryDrivers(
  memories: { metadata?: Record<string, unknown> }[],
): DriverChip[] {
  const valid: DriverChip[] = ["stats", "vibes", "loyalty", "chaos"];
  return memories
    .map((m) => m.metadata?.driver)
    .filter(
      (d): d is DriverChip =>
        typeof d === "string" && valid.includes(d as DriverChip),
    );
}
