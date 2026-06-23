import { computeMaturityProgress } from "@/lib/auth/maturity";
import { getArenaRecordsForSlugs } from "@/lib/db/clash-bouts";
import { query } from "@/lib/db/client";
import {
  computeCloneMatchPercent,
  computeLearningScore,
} from "@/lib/leaderboard/compute-learning-score";
import type { LeaderboardData, LeaderboardEntry } from "@/lib/leaderboard/types";

type UserRow = {
  id: string;
  display_name: string | null;
  public_slug: string;
  created_at: Date;
  favorite_team: string | null;
  memories_count: number;
};

type AgreementRow = {
  user_id: string;
  comparable_predictions: number;
  clone_agreement_count: number;
};

type UnrankedEntry = Omit<LeaderboardEntry, "rank">;

function compareEntries(a: UnrankedEntry, b: UnrankedEntry): number {
  if (b.learningScore !== a.learningScore) {
    return b.learningScore - a.learningScore;
  }
  if (b.cloneMatchPercent !== a.cloneMatchPercent) {
    return b.cloneMatchPercent - a.cloneMatchPercent;
  }
  if (b.memoriesCount !== a.memoriesCount) {
    return b.memoriesCount - a.memoriesCount;
  }
  return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
}

function assignRanks(sorted: UnrankedEntry[]): LeaderboardEntry[] {
  const ranked: LeaderboardEntry[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const prev = ranked[i - 1];
    const rank =
      prev &&
      prev.learningScore === entry.learningScore &&
      prev.cloneMatchPercent === entry.cloneMatchPercent &&
      prev.memoriesCount === entry.memoriesCount
        ? prev.rank
        : i + 1;

    ranked.push({ ...entry, rank });
  }

  return ranked;
}

export async function buildLeaderboard(
  viewerUserId?: string | null,
): Promise<LeaderboardData> {
  const [userRows, agreementRows] = await Promise.all([
    query<UserRow>(
      `select u.id, u.display_name, u.public_slug, u.created_at,
              fp.favorite_team,
              count(m.id)::int as memories_count
       from users u
       join fan_profiles fp on fp.user_id = u.id
       left join memories m on m.user_id = u.id
       where fp.public_enabled = true and u.public_slug is not null
       group by u.id, u.display_name, u.public_slug, u.created_at, fp.favorite_team`,
    ),
    query<AgreementRow>(
      `select p.user_id,
              count(*)::int as comparable_predictions,
              count(*) filter (
                where p.predicted_winner = cp.predicted_winner
                  and p.predicted_score_a = cp.predicted_score_a
                  and p.predicted_score_b = cp.predicted_score_b
              )::int as clone_agreement_count
       from predictions p
       inner join clone_predictions cp
         on cp.user_id = p.user_id and cp.match_id = p.match_id
       group by p.user_id`,
    ),
  ]);

  const agreementByUser = new Map(
    agreementRows.map((row) => [row.user_id, row]),
  );

  const slugs = userRows.map((row) => row.public_slug);
  const arenaBySlug = await getArenaRecordsForSlugs(slugs).catch(
    () => new Map<string, { wins: number; losses: number; draws: number }>(),
  );

  const unranked: UnrankedEntry[] = userRows.map((row) => {
    const agreement = agreementByUser.get(row.id);
    const comparablePredictions = agreement?.comparable_predictions ?? 0;
    const cloneAgreementCount = agreement?.clone_agreement_count ?? 0;
    const cloneMatchPercent = computeCloneMatchPercent(
      cloneAgreementCount,
      comparablePredictions,
    );
    const maturity = computeMaturityProgress(row.memories_count);
    const arena = arenaBySlug.get(row.public_slug);

    return {
      userId: row.id,
      slug: row.public_slug,
      displayName: row.display_name?.trim() || row.public_slug,
      maturityLabel: maturity.label,
      tierProgress: maturity.tierProgress,
      memoriesCount: row.memories_count,
      cloneAgreementCount,
      comparablePredictions,
      cloneMatchPercent,
      learningScore: computeLearningScore(
        row.memories_count,
        cloneAgreementCount,
      ),
      favoriteTeam: row.favorite_team,
      joinedAt: row.created_at.toISOString(),
      arenaWins: arena?.wins ?? 0,
      arenaLosses: arena?.losses ?? 0,
      arenaDraws: arena?.draws ?? 0,
    };
  });

  const entries = assignRanks([...unranked].sort(compareEntries));
  const viewerEntry = viewerUserId
    ? (entries.find((e) => e.userId === viewerUserId) ?? null)
    : null;

  return {
    entries,
    totalPlayers: entries.length,
    viewerEntry,
  };
}
