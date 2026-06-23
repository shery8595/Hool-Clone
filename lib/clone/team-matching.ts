import type { Match, Team } from "@/lib/mock/types";

export const LOYALTY_CLAIM_RE =
  /\b(loyal|always back|ride or die|never bet against|bleed|die-?hard|through thick|win or lose)\b/i;
export const RIVAL_DISTRUST_RE =
  /\b(never trust|don't trust|do not trust|distrust|can't stand|cannot stand|skeptic|hate them)\b/i;
export const UNDERDOG_CLAIM_RE =
  /\b(underdog|dark horse|upset|root for the little|love an upset)\b/i;

export function teamMatchesRef(team: Team, ref: string | null | undefined): boolean {
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

export function teamMatchesName(teamName: string, needle: string | null | undefined): boolean {
  if (!needle) return false;
  const name = teamName.toLowerCase();
  const n = needle.toLowerCase();
  return name.includes(n) || n.includes(name.slice(0, 4));
}

export function matchInvolvesRef(
  match: Match,
  ref: string | null | undefined,
): boolean {
  if (!ref || !match.homeTeam || !match.awayTeam) return false;
  return (
    teamMatchesRef(match.homeTeam, ref) || teamMatchesRef(match.awayTeam, ref)
  );
}

export function winnerTeam(match: Match, winnerCode: string): Team | null {
  if (!match.homeTeam || !match.awayTeam) return null;
  if (winnerCode === match.homeTeam.code) return match.homeTeam;
  if (winnerCode === match.awayTeam.code) return match.awayTeam;
  return null;
}

export function textMentionsTeam(text: string, team: Team): boolean {
  const haystack = text.toLowerCase();
  return (
    haystack.includes(team.name.toLowerCase()) ||
    haystack.includes(team.code.toLowerCase())
  );
}
