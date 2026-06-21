import { wc2026Teams } from "@/lib/mock/wc2026-teams";

/** API-Football / FIFA naming variants → HoolClone team codes */
const API_NAME_ALIASES: Record<string, string> = {
  "south korea": "KOR",
  "netherlands": "NED",
  "holland": "NED",
  "korea republic": "KOR",
  "korea": "KOR",
  "usa": "USA",
  "united states": "USA",
  "united states of america": "USA",
  "iran": "IRN",
  "ir iran": "IRN",
  "cote d'ivoire": "CIV",
  "côte d'ivoire": "CIV",
  "ivory coast": "CIV",
  "cape verde": "CPV",
  "cabo verde": "CPV",
  "dr congo": "COD",
  "congo dr": "COD",
  "democratic republic of the congo": "COD",
  "congo": "COD",
  "curacao": "CUW",
  "curaçao": "CUW",
  "czech republic": "CZE",
  "czechia": "CZE",
  "turkey": "TUR",
  "türkiye": "TUR",
  "bosnia": "BIH",
  "bosnia and herzegovina": "BIH",
  "bosnia-herzegovina": "BIH",
  "south africa": "RSA",
  "saudi arabia": "KSA",
  "new zealand": "NZL",
  "north macedonia": "MKD",
};

const nameToCode = new Map<string, string>();

for (const team of wc2026Teams) {
  nameToCode.set(team.name.toLowerCase(), team.code);
  nameToCode.set(team.code.toLowerCase(), team.code);
}

for (const [alias, code] of Object.entries(API_NAME_ALIASES)) {
  nameToCode.set(alias.toLowerCase(), code);
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function apiTeamNameToCode(name: string): string | null {
  const key = normalizeName(name);
  if (nameToCode.has(key)) return nameToCode.get(key)!;

  for (const team of wc2026Teams) {
    const teamKey = normalizeName(team.name);
    if (key.includes(teamKey) || teamKey.includes(key)) {
      return team.code;
    }
  }

  return null;
}

export function codesMatchFixture(
  homeCode: string,
  awayCode: string,
  dbHome: string,
  dbAway: string,
): boolean {
  return (
    (homeCode === dbHome && awayCode === dbAway) ||
    (homeCode === dbAway && awayCode === dbHome)
  );
}
