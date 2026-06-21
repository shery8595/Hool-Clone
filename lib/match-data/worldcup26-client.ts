import type { MatchStatus } from "@/lib/mock/types";
import type { NormalizedFixture } from "@/lib/match-data/fixture-types";
import { getWorldCup26BaseUrl } from "@/lib/env";

const DEFAULT_BASE_URL = "https://worldcup26.ir";

type RawGame = {
  id?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
  local_date?: string;
  finished?: string | boolean;
  time_elapsed?: string;
  home_score?: string | number | null;
  away_score?: string | number | null;
};

type GamesResponse = {
  games?: RawGame[];
};

function parseScore(value: string | number | null | undefined): number | null {
  if (value == null || value === "" || value === "null") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isFinishedFlag(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  return String(value ?? "").toUpperCase() === "TRUE";
}

function mapWorldCup26Status(
  finished: boolean,
  timeElapsed: string | null,
): MatchStatus {
  if (finished || timeElapsed === "finished") return "final";
  if (!timeElapsed || timeElapsed === "notstarted") return "scheduled";
  return "live";
}

/** Parse MM/DD/YYYY HH:mm from worldcup26 into ISO (venue-local treated as UTC offset unknown — use for proximity only). */
export function parseWorldCup26LocalDate(localDate: string): string {
  const match = localDate.trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
  );
  if (!match) return new Date(localDate).toISOString();

  const [, mm, dd, yyyy, hh, min] = match;
  const iso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${hh.padStart(2, "0")}:${min}:00`;
  return new Date(iso).toISOString();
}

function normalizeGame(raw: RawGame): NormalizedFixture | null {
  const homeTeamName = raw.home_team_name_en?.trim();
  const awayTeamName = raw.away_team_name_en?.trim();
  if (!homeTeamName || !awayTeamName) return null;
  if (homeTeamName.includes("Winner") || awayTeamName.includes("Runner")) {
    return null;
  }

  const matchNumber = raw.id ? Number.parseInt(raw.id, 10) : NaN;
  const finished = isFinishedFlag(raw.finished);
  const timeElapsed = raw.time_elapsed?.trim() ?? null;
  const status = mapWorldCup26Status(finished, timeElapsed);

  return {
    providerId: raw.id ?? "",
    matchNumber: Number.isFinite(matchNumber) ? matchNumber : null,
    homeTeamName,
    awayTeamName,
    kickoffAt: raw.local_date
      ? parseWorldCup26LocalDate(raw.local_date)
      : new Date().toISOString(),
    status,
    homeGoals: parseScore(raw.home_score),
    awayGoals: parseScore(raw.away_score),
    timeElapsed,
    finished,
  };
}

export async function fetchWorldCup26FixturesForSync(): Promise<
  NormalizedFixture[]
> {
  const baseUrl = getWorldCup26BaseUrl() ?? DEFAULT_BASE_URL;
  const url = `${baseUrl.replace(/\/$/, "")}/get/games`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(
      `worldcup26.ir request failed (${response.status} ${response.statusText})`,
    );
  }

  const data = (await response.json()) as GamesResponse;
  const games = data.games ?? [];

  return games
    .map(normalizeGame)
    .filter((fixture): fixture is NormalizedFixture => fixture != null);
}
