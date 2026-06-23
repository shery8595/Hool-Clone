import { apiTeamNameToCode } from "@/lib/match-data/football-team-map";
import { getTeamDef, wc2026Teams } from "@/lib/mock/wc2026-teams";

export type TeamTextToken =
  | { type: "text"; value: string }
  | { type: "team"; value: string; code: string };

type TeamSearchTerm = {
  match: string;
  code: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTeamSearchTerms(): TeamSearchTerm[] {
  const seen = new Set<string>();
  const terms: TeamSearchTerm[] = [];

  const add = (match: string, code: string) => {
    const key = `${match.toLowerCase()}::${code}`;
    if (!match.trim() || seen.has(key)) return;
    seen.add(key);
    terms.push({ match: match.trim(), code });
  };

  for (const team of wc2026Teams) {
    add(team.name, team.code);
    add(team.code, team.code);
  }

  return terms.sort((a, b) => b.match.length - a.match.length);
}

let cachedTerms: TeamSearchTerm[] | null = null;

function teamSearchTerms(): TeamSearchTerm[] {
  if (!cachedTerms) cachedTerms = buildTeamSearchTerms();
  return cachedTerms;
}

export function resolveTeamCode(label: string): string | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    const code = trimmed.toUpperCase();
    return getTeamDef(code) ? code : apiTeamNameToCode(trimmed);
  }
  return apiTeamNameToCode(trimmed);
}

export type ParsedMatchLabelTeams = {
  homeLabel: string;
  awayLabel: string;
  homeCode: string;
  awayCode: string;
  scoreA?: number;
  scoreB?: number;
  raw: string;
};

export function parseMatchLabelTeams(
  label: string | null | undefined,
): ParsedMatchLabelTeams | null {
  if (!label?.trim()) return null;

  const trimmed = label.trim();
  const vsMatch = trimmed.match(
    /^(.+?)\s+vs\s+(.+?)(?:\s*\((\d+)\s*[-–]\s*(\d+)\))?\s*$/i,
  );
  if (!vsMatch) return null;

  const homeLabel = vsMatch[1].trim();
  const awayLabel = vsMatch[2].trim();
  const homeCode = resolveTeamCode(homeLabel);
  const awayCode = resolveTeamCode(awayLabel);
  if (!homeCode || !awayCode) return null;

  return {
    homeLabel,
    awayLabel,
    homeCode,
    awayCode,
    scoreA: vsMatch[3] ? Number(vsMatch[3]) : undefined,
    scoreB: vsMatch[4] ? Number(vsMatch[4]) : undefined,
    raw: trimmed,
  };
}

function isBoundary(text: string, index: number, length: number): boolean {
  const before = index > 0 ? text[index - 1] : "";
  const after = index + length < text.length ? text[index + length] : "";
  const boundary = /[^A-Za-z0-9]/;

  const beforeOk = !before || boundary.test(before);
  const afterOk = !after || boundary.test(after);
  return beforeOk && afterOk;
}

export function tokenizeTextWithTeams(text: string): TeamTextToken[] {
  if (!text) return [{ type: "text", value: "" }];

  const tokens: TeamTextToken[] = [];
  let index = 0;

  while (index < text.length) {
    let matched: TeamSearchTerm | null = null;

    for (const term of teamSearchTerms()) {
      const slice = text.slice(index, index + term.match.length);
      if (slice.toLowerCase() !== term.match.toLowerCase()) continue;
      if (!isBoundary(text, index, term.match.length)) continue;
      matched = term;
      break;
    }

    if (!matched) {
      const nextIndex = index + 1;
      const last = tokens[tokens.length - 1];
      const char = text[index];
      if (last?.type === "text") {
        last.value += char;
      } else {
        tokens.push({ type: "text", value: char });
      }
      index = nextIndex;
      continue;
    }

    tokens.push({
      type: "team",
      value: text.slice(index, index + matched.match.length),
      code: matched.code,
    });
    index += matched.match.length;
  }

  return tokens.length > 0 ? tokens : [{ type: "text", value: text }];
}
