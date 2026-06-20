#!/usr/bin/env node
/**
 * Downloads SVG flags for all WC 2026 teams into public/flags/
 * Source: https://flagcdn.com
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TEAMS = [
  ["MEX", "mx"], ["RSA", "za"], ["KOR", "kr"], ["CZE", "cz"],
  ["CAN", "ca"], ["BIH", "ba"], ["QAT", "qa"], ["SUI", "ch"],
  ["BRA", "br"], ["MAR", "ma"], ["HAI", "ht"], ["SCO", "gb-sct"],
  ["USA", "us"], ["PAR", "py"], ["AUS", "au"], ["TUR", "tr"],
  ["GER", "de"], ["CUW", "cw"], ["CIV", "ci"], ["ECU", "ec"],
  ["NED", "nl"], ["JPN", "jp"], ["SWE", "se"], ["TUN", "tn"],
  ["BEL", "be"], ["EGY", "eg"], ["IRN", "ir"], ["NZL", "nz"],
  ["ESP", "es"], ["CPV", "cv"], ["KSA", "sa"], ["URU", "uy"],
  ["FRA", "fr"], ["SEN", "sn"], ["IRQ", "iq"], ["NOR", "no"],
  ["ARG", "ar"], ["ALG", "dz"], ["AUT", "at"], ["JOR", "jo"],
  ["POR", "pt"], ["COD", "cd"], ["UZB", "uz"], ["COL", "co"],
  ["ENG", "gb-eng"], ["CRO", "hr"], ["GHA", "gh"], ["PAN", "pa"],
];

const OUT_DIR = path.join(process.cwd(), "public", "flags");

async function downloadFlag([code, flagIso]) {
  const url = `https://flagcdn.com/${flagIso}.svg`;
  const outPath = path.join(OUT_DIR, `${code.toLowerCase()}.svg`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed ${code} (${flagIso}): ${res.status}`);
  }

  await writeFile(outPath, await res.text(), "utf8");
  console.log(`✓ ${code}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Downloading ${TEAMS.length} flags...\n`);

  const results = await Promise.allSettled(TEAMS.map(downloadFlag));
  const failed = results.filter((r) => r.status === "rejected");

  if (failed.length) {
    failed.forEach((f) => {
      if (f.status === "rejected") console.error(f.reason);
    });
    process.exit(1);
  }

  console.log(`\nDone — ${TEAMS.length} flags in public/flags/`);
}

main();
