import {
  cacheKeys,
  fetchCached,
  peekCached,
  revalidateCached,
} from "@/lib/api/data-cache";
import {
  fetchDashboardRaw,
  fetchMatchesRaw,
  fetchMemoriesRaw,
  fetchPredictionHistoryRaw,
} from "@/lib/api/client";

export function prefetchDashboard(userId: string): void {
  if (peekCached(cacheKeys.dashboard(userId))) return;
  void fetchCached(cacheKeys.dashboard(userId), fetchDashboardRaw);
}

export function prefetchMemories(userId: string): void {
  if (peekCached(cacheKeys.memories(userId))) return;
  void fetchCached(cacheKeys.memories(userId), fetchMemoriesRaw);
}

export function prefetchMatches(): void {
  if (peekCached(cacheKeys.matches())) return;
  void fetchCached(cacheKeys.matches(), fetchMatchesRaw, 120_000);
}

export function prefetchPredictionHistory(userId: string): void {
  if (peekCached(cacheKeys.predictionHistory(userId))) return;
  void fetchCached(cacheKeys.predictionHistory(userId), fetchPredictionHistoryRaw);
}

export function prefetchRoute(href: string, userId?: string): void {
  if (href === "/dashboard" && userId) prefetchDashboard(userId);
  if (href === "/memory" && userId) prefetchMemories(userId);
  if (href === "/evolution" && userId) prefetchDashboard(userId);
  if (href === "/predict") {
    prefetchMatches();
    if (userId) prefetchPredictionHistory(userId);
  }
}

export function prefetchAppData(userId: string): void {
  prefetchDashboard(userId);
  prefetchMatches();
  prefetchMemories(userId);
  prefetchPredictionHistory(userId);
}

export function warmDashboard(userId: string): void {
  void revalidateCached(cacheKeys.dashboard(userId), fetchDashboardRaw);
}

