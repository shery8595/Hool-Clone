import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { Team } from "@/lib/mock/types";

function teamMatchesRef(team: Team, ref: string): boolean {
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

function extractTeamMentions(
  message: string,
  profile: Pick<DbFanProfile, "favorite_team" | "rival_team"> | null,
): string[] {
  const candidates = [
    profile?.favorite_team,
    profile?.rival_team,
  ].filter((t): t is string => Boolean(t));

  const lower = message.toLowerCase();
  const mentioned = candidates.filter((team) => lower.includes(team.toLowerCase()));

  const neverPickMatch = lower.match(
    /(?:never|wouldn't|would not|won't|will not)\s+(?:pick|back|bet on|support)\s+([a-z][a-z\s]{2,24})/i,
  );
  if (neverPickMatch?.[1]) {
    mentioned.push(neverPickMatch[1].trim());
  }

  return [...new Set(mentioned)];
}

export function findPredictionRebuttal(
  userMessage: string,
  history: PredictionHistoryItem[],
  profile: Pick<DbFanProfile, "favorite_team" | "rival_team"> | null,
): string | null {
  if (!/\b(never|always|wouldn't|would not|every time)\b/i.test(userMessage)) {
    return null;
  }

  const teams = extractTeamMentions(userMessage, profile);
  if (teams.length === 0) return null;

  for (const teamRef of teams) {
    const picks: string[] = [];
    for (const { match, prediction } of history) {
      if (!match.homeTeam || !match.awayTeam) continue;
      const winner =
        prediction.winner === match.homeTeam.code
          ? match.homeTeam
          : match.awayTeam;
      if (!winner || !teamMatchesRef(winner, teamRef)) continue;
      if (
        !teamMatchesRef(match.homeTeam, teamRef) &&
        !teamMatchesRef(match.awayTeam, teamRef)
      ) {
        continue;
      }
      picks.push(
        `${match.homeTeam.name} vs ${match.awayTeam.name} (${match.stage})`,
      );
      if (picks.length >= 3) break;
    }

    if (picks.length > 0) {
      const list = picks.join("; ");
      return `You say you'd never back ${teamRef}, but your prediction history shows you picked them in ${picks.length === 1 ? "a match" : `${picks.length} matches`}: ${list}.`;
    }
  }

  return null;
}
