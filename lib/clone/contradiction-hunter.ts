import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { DriverChip, Match, Team } from "@/lib/mock/types";

export type ContradictionKind =
  | "loyalty"
  | "rival"
  | "style"
  | "underdog"
  | "clone_disagreement";

export type ContradictionFinding = {
  id: string;
  kind: ContradictionKind;
  text: string;
  label: string;
  severity: number;
};

export type DashboardContradiction = {
  text: string;
  label: string;
  source: "hunter" | "clone";
  kind?: ContradictionKind;
};

const LOYALTY_CLAIM_RE =
  /\b(loyal|always back|ride or die|never bet against|bleed|die-?hard|through thick|win or lose)\b/i;
const RIVAL_DISTRUST_RE =
  /\b(never trust|don't trust|do not trust|distrust|can't stand|cannot stand|skeptic|hate them)\b/i;
const UNDERDOG_CLAIM_RE =
  /\b(underdog|dark horse|upset|root for the little|love an upset)\b/i;

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
    teamMatchesRef(match.homeTeam, ref) ||
    teamMatchesRef(match.awayTeam, ref)
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
  favorite: string,
): boolean | null {
  if (!match.homeTeam || !match.awayTeam) return null;
  if (!matchInvolvesRef(match, favorite)) return null;
  const winner = winnerTeam(match, winnerCode);
  if (!winner) return null;
  return teamMatchesRef(winner, favorite);
}

function isKnockoutStage(stage: string): boolean {
  const s = stage.toLowerCase();
  if (s.includes("group")) return false;
  return (
    s.includes("knockout") ||
    s.includes("round of") ||
    s.includes("quarter") ||
    s.includes("semi") ||
    s.includes("final") ||
    s.includes("last 16") ||
    s.includes("last 32")
  );
}

function pluralTimes(count: number): string {
  if (count === 1) return "once";
  if (count === 2) return "twice";
  return `${count} times`;
}

function claimsLoyaltyTo(
  team: string,
  input: HuntContradictionsInput,
): boolean {
  if (input.profile?.favorite_team) {
    const fav = input.profile.favorite_team.toLowerCase();
    const ref = team.toLowerCase();
    if (fav === ref || fav.includes(ref) || ref.includes(fav)) return true;
  }

  if (input.memoryDrivers.includes("loyalty")) return true;

  return input.memoryTexts.some((text) => {
    const lower = text.toLowerCase();
    if (!LOYALTY_CLAIM_RE.test(lower)) return false;
    const teamLower = team.toLowerCase();
    return lower.includes(teamLower) || teamLower.includes(lower.split(" ")[0] ?? "");
  });
}

function claimsRivalDistrust(
  rival: string,
  input: HuntContradictionsInput,
): boolean {
  if (input.profile?.rival_team) {
    const r = input.profile.rival_team.toLowerCase();
    const ref = rival.toLowerCase();
    if (r === ref || r.includes(ref) || ref.includes(r)) return true;
  }

  return input.memoryTexts.some((text) => {
    const lower = text.toLowerCase();
    if (!RIVAL_DISTRUST_RE.test(lower)) return false;
    const rivalLower = rival.toLowerCase();
    return lower.includes(rivalLower);
  });
}

function claimsUnderdogLove(input: HuntContradictionsInput): boolean {
  if (input.memoryDrivers.includes("chaos")) return true;
  return (
    input.memoryTexts.some((text) => UNDERDOG_CLAIM_RE.test(text)) ||
    Boolean(input.profile?.summary?.toLowerCase().includes("underdog"))
  );
}

export type HuntContradictionsInput = {
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style" | "summary"
  > | null;
  history: PredictionHistoryItem[];
  memoryDrivers: DriverChip[];
  memoryTexts: string[];
};

function detectLoyaltyAbandonment(
  input: HuntContradictionsInput,
): ContradictionFinding | null {
  const team = input.profile?.favorite_team;
  if (!team || !claimsLoyaltyTo(team, input)) return null;

  const abandonments: { match: Match; knockout: boolean }[] = [];

  for (const { match, prediction } of input.history) {
    if (!match.homeTeam || !match.awayTeam) continue;
    const backed = pickedFavorite(match, prediction.winner, team);
    if (backed === false) {
      abandonments.push({ match, knockout: isKnockoutStage(match.stage) });
    }
  }

  if (abandonments.length === 0) return null;

  const knockoutCount = abandonments.filter((a) => a.knockout).length;
  const total = abandonments.length;
  const latest = abandonments[0]!.match;

  let text: string;
  if (knockoutCount >= 2) {
    text = `You claim loyalty to ${team}, but your prediction history abandoned them ${pluralTimes(knockoutCount)} in knockout matches.`;
  } else if (knockoutCount === 1 && total === 1) {
    text = `You claim loyalty to ${team}, but your prediction history abandoned them in a knockout match.`;
  } else if (knockoutCount > 0) {
    text = `You claim loyalty to ${team}, but your prediction history abandoned them ${pluralTimes(total)} (${knockoutCount} in knockout matches).`;
  } else {
    text = `You claim loyalty to ${team}, but your prediction history abandoned them ${pluralTimes(total)} when they played.`;
  }

  return {
    id: "loyalty-abandonment",
    kind: "loyalty",
    text,
    label: `${latest.homeTeam!.name} vs ${latest.awayTeam!.name}`,
    severity: 8 + Math.min(knockoutCount, 2),
  };
}

function detectRivalBetrayal(
  input: HuntContradictionsInput,
): ContradictionFinding | null {
  const rival = input.profile?.rival_team;
  if (!rival || !claimsRivalDistrust(rival, input)) return null;

  const betrayals: Match[] = [];

  for (const { match, prediction } of input.history) {
    if (!match.homeTeam || !match.awayTeam) continue;
    if (!matchInvolvesRef(match, rival)) continue;
    const winner = winnerTeam(match, prediction.winner);
    if (winner && teamMatchesRef(winner, rival)) {
      betrayals.push(match);
    }
  }

  if (betrayals.length === 0) return null;

  const latest = betrayals[0]!;
  return {
    id: "rival-betrayal",
    kind: "rival",
    text: `You say you never trust ${rival}, but you backed them to win ${pluralTimes(betrayals.length)} when they played.`,
    label: `${latest.homeTeam!.name} vs ${latest.awayTeam!.name}`,
    severity: 7 + Math.min(betrayals.length, 2),
  };
}

function detectStyleHypocrisy(
  input: HuntContradictionsInput,
): ContradictionFinding | null {
  const style = input.profile?.preferred_style?.toLowerCase() ?? "";
  if (!style) return null;

  const vibePicks = input.history.filter(
    ({ prediction }) =>
      prediction.confidence >= 65 &&
      (prediction.emotion === "hyped" || prediction.emotion === "nervous"),
  );

  const statsPicks = input.history.filter(
    ({ prediction }) =>
      prediction.confidence <= 55 &&
      prediction.emotion === "calm" &&
      /\b(data|stat|form|xG|table|analytics)\b/i.test(prediction.reasoning),
  );

  if (style.includes("stat") && vibePicks.length >= 2) {
    const latest = vibePicks[0]!;
    return {
      id: "style-vibes",
      kind: "style",
      text: `You claim you pick with stats, but ${vibePicks.length} of your predictions were high-confidence emotional calls.`,
      label: `${latest.match.homeTeam?.name ?? "Match"} vs ${latest.match.awayTeam?.name ?? ""}`,
      severity: 6,
    };
  }

  if (style.includes("vibe") && statsPicks.length >= 2) {
    const latest = statsPicks[0]!;
    return {
      id: "style-stats",
      kind: "style",
      text: `You say you follow vibes, but your receipts read like a spreadsheet — ${statsPicks.length} calm, stats-heavy picks.`,
      label: `${latest.match.homeTeam?.name ?? "Match"} vs ${latest.match.awayTeam?.name ?? ""}`,
      severity: 5,
    };
  }

  return null;
}

function detectUnderdogContradiction(
  input: HuntContradictionsInput,
): ContradictionFinding | null {
  if (!claimsUnderdogLove(input) || input.history.length < 3) return null;

  const favorite = input.profile?.favorite_team ?? null;
  let underdogPicks = 0;
  let samples = 0;

  for (const { match, prediction } of input.history) {
    if (!match.homeTeam || !match.awayTeam) continue;
    const favoriteInMatch = matchInvolvesRef(match, favorite);
    const lowConfidence = prediction.confidence <= 55;

    if (!favoriteInMatch && lowConfidence) {
      underdogPicks += 1;
      samples += 1;
    } else if (favoriteInMatch) {
      const backed = favorite
        ? pickedFavorite(match, prediction.winner, favorite)
        : null;
      if (backed === false) {
        underdogPicks += 1;
        samples += 1;
      } else if (backed === true) {
        samples += 1;
      }
    } else {
      samples += 1;
    }
  }

  if (samples < 3) return null;
  const rate = underdogPicks / samples;
  if (rate >= 0.4) return null;

  return {
    id: "underdog-claim",
    kind: "underdog",
    text: "You say you love underdogs. Your prediction history says you love safe favorites with good branding.",
    label: "Prediction pattern",
    severity: 6,
  };
}

export function huntContradictions(
  input: HuntContradictionsInput,
): ContradictionFinding[] {
  const findings = [
    detectLoyaltyAbandonment(input),
    detectRivalBetrayal(input),
    detectUnderdogContradiction(input),
    detectStyleHypocrisy(input),
  ].filter((f): f is ContradictionFinding => f !== null);

  return findings.sort((a, b) => b.severity - a.severity);
}

export function pickDashboardContradiction(
  findings: ContradictionFinding[],
  cloneDisagreement: { text: string; label: string } | null,
): DashboardContradiction | null {
  const top = findings[0];
  if (top) {
    return {
      text: top.text,
      label: top.label,
      source: "hunter",
      kind: top.kind,
    };
  }
  if (cloneDisagreement) {
    return { ...cloneDisagreement, source: "clone" };
  }
  return null;
}
