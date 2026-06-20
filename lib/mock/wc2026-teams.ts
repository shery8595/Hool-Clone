/**
 * All 48 FIFA World Cup 2026 qualified teams.
 * `flagIso` maps to flagcdn.com paths: https://flagcdn.com/{flagIso}.svg
 */
export type WcTeamDef = {
  code: string;
  name: string;
  flagIso: string;
  group: string;
};

export const wc2026Teams: WcTeamDef[] = [
  { code: "MEX", name: "Mexico", flagIso: "mx", group: "A" },
  { code: "RSA", name: "South Africa", flagIso: "za", group: "A" },
  { code: "KOR", name: "Korea Republic", flagIso: "kr", group: "A" },
  { code: "CZE", name: "Czechia", flagIso: "cz", group: "A" },
  { code: "CAN", name: "Canada", flagIso: "ca", group: "B" },
  { code: "SUI", name: "Switzerland", flagIso: "ch", group: "B" },
  { code: "QAT", name: "Qatar", flagIso: "qa", group: "B" },
  { code: "BIH", name: "Bosnia and Herzegovina", flagIso: "ba", group: "B" },
  { code: "BRA", name: "Brazil", flagIso: "br", group: "C" },
  { code: "MAR", name: "Morocco", flagIso: "ma", group: "C" },
  { code: "HAI", name: "Haiti", flagIso: "ht", group: "C" },
  { code: "SCO", name: "Scotland", flagIso: "gb-sct", group: "C" },
  { code: "USA", name: "United States", flagIso: "us", group: "D" },
  { code: "PAR", name: "Paraguay", flagIso: "py", group: "D" },
  { code: "AUS", name: "Australia", flagIso: "au", group: "D" },
  { code: "TUR", name: "Türkiye", flagIso: "tr", group: "D" },
  { code: "GER", name: "Germany", flagIso: "de", group: "E" },
  { code: "CUW", name: "Curaçao", flagIso: "cw", group: "E" },
  { code: "CIV", name: "Côte d'Ivoire", flagIso: "ci", group: "E" },
  { code: "ECU", name: "Ecuador", flagIso: "ec", group: "E" },
  { code: "NED", name: "Netherlands", flagIso: "nl", group: "F" },
  { code: "JPN", name: "Japan", flagIso: "jp", group: "F" },
  { code: "SWE", name: "Sweden", flagIso: "se", group: "F" },
  { code: "TUN", name: "Tunisia", flagIso: "tn", group: "F" },
  { code: "BEL", name: "Belgium", flagIso: "be", group: "G" },
  { code: "EGY", name: "Egypt", flagIso: "eg", group: "G" },
  { code: "IRN", name: "IR Iran", flagIso: "ir", group: "G" },
  { code: "NZL", name: "New Zealand", flagIso: "nz", group: "G" },
  { code: "ESP", name: "Spain", flagIso: "es", group: "H" },
  { code: "CPV", name: "Cabo Verde", flagIso: "cv", group: "H" },
  { code: "KSA", name: "Saudi Arabia", flagIso: "sa", group: "H" },
  { code: "URU", name: "Uruguay", flagIso: "uy", group: "H" },
  { code: "FRA", name: "France", flagIso: "fr", group: "I" },
  { code: "SEN", name: "Senegal", flagIso: "sn", group: "I" },
  { code: "IRQ", name: "Iraq", flagIso: "iq", group: "I" },
  { code: "NOR", name: "Norway", flagIso: "no", group: "I" },
  { code: "ARG", name: "Argentina", flagIso: "ar", group: "J" },
  { code: "ALG", name: "Algeria", flagIso: "dz", group: "J" },
  { code: "AUT", name: "Austria", flagIso: "at", group: "J" },
  { code: "JOR", name: "Jordan", flagIso: "jo", group: "J" },
  { code: "POR", name: "Portugal", flagIso: "pt", group: "K" },
  { code: "COD", name: "Congo DR", flagIso: "cd", group: "K" },
  { code: "UZB", name: "Uzbekistan", flagIso: "uz", group: "K" },
  { code: "COL", name: "Colombia", flagIso: "co", group: "K" },
  { code: "ENG", name: "England", flagIso: "gb-eng", group: "L" },
  { code: "CRO", name: "Croatia", flagIso: "hr", group: "L" },
  { code: "GHA", name: "Ghana", flagIso: "gh", group: "L" },
  { code: "PAN", name: "Panama", flagIso: "pa", group: "L" },
];

export const wc2026Groups: Record<string, string[]> = Object.fromEntries(
  "ABCDEFGHIJKL".split("").map((g) => [
    g,
    wc2026Teams.filter((t) => t.group === g).map((t) => t.code),
  ]),
);

export function getTeamDef(code: string): WcTeamDef | undefined {
  return wc2026Teams.find((t) => t.code === code);
}

export function flagPath(code: string): string {
  return `/flags/${code.toLowerCase()}.svg`;
}
