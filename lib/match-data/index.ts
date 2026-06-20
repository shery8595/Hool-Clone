import { DbMatchDataAdapter } from "@/lib/match-data/db-match-data-adapter";
import type { MatchDataAdapter } from "@/lib/match-data/match-data-adapter";

let adapter: MatchDataAdapter | null = null;

export function getMatchDataAdapter(): MatchDataAdapter {
  if (!adapter) {
    adapter = new DbMatchDataAdapter();
  }
  return adapter;
}
