import type {
  BiasAxis,
  CloneMaturity,
  DebateMessage,
  DriverChip,
  EmotionState,
  EvolutionEvent,
  Match,
  MemoryReceipt,
  Prediction,
  PredictionComparison,
} from "@/lib/mock/types";
import type { DashboardData } from "@/lib/dashboard/types";
import type { PublicProfileData } from "@/lib/db/public-profile-types";
import type { ClashDebateResult, WalrusBlobProof } from "@/lib/clash/types";
import { cacheKeys, fetchCached, invalidateCache } from "@/lib/api/data-cache";

export type MeData = {
  id: string;
  walletAddress: string | null;
  displayName: string | null;
  publicSlug: string | null;
  memwalNamespace: string;
  profile: {
    favoriteTeam: string | null;
    rivalTeam: string | null;
    preferredStyle: string | null;
    tone: string;
    cloneMaturity: number;
    cloneMaturityLabel: CloneMaturity;
    publicEnabled: boolean;
    summary: string | null;
    onboardingComplete: boolean;
    memoriesCount: number;
  };
};

export type OnboardingQuestion = {
  id: string;
  question: string;
  placeholder: string;
  maxLength: number;
  answered?: boolean;
  previousAnswer?: string;
  previousDriver?: DriverChip;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      typeof body.error === "string" ? body.error : `Request failed (${response.status})`,
    );
  }
  return response.json() as Promise<T>;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 12000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMe(): Promise<MeData | null> {
  const response = await fetch("/api/me", { credentials: "include" });
  if (!response.ok) {
    if (response.status === 401) return null;
    return parseJson<MeData>(response);
  }
  const data = (await response.json()) as MeData | null;
  return data;
}

export type WalletSignMessageFn = (message: string) => Promise<string>;

export async function fetchWalletAuthChallenge(walletAddress: string): Promise<{
  message: string;
  challengeToken: string;
  expiresIn: number;
}> {
  const response = await fetchWithTimeout("/api/auth/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  return parseJson(response);
}

export async function authWallet(
  walletAddress: string,
  signMessage: WalletSignMessageFn,
): Promise<MeData> {
  const challenge = await fetchWalletAuthChallenge(walletAddress);
  const signature = await signMessage(challenge.message);

  const response = await fetchWithTimeout("/api/auth/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      walletAddress,
      challengeToken: challenge.challengeToken,
      signature,
    }),
  });
  return parseJson<MeData>(response);
}

export async function updateProfile(input: {
  displayName?: string;
  favoriteTeam?: string;
  rivalTeam?: string;
  preferredStyle?: string;
}): Promise<MeData> {
  const response = await fetch("/api/me/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseJson<MeData>(response);
}

export async function enablePublicProfile(): Promise<{ slug: string; me: MeData }> {
  const response = await fetch("/api/me/public-profile", {
    method: "POST",
    credentials: "include",
  });
  return parseJson<{ slug: string; me: MeData }>(response);
}

export async function fetchOnboardingQuestions(): Promise<{
  questions: OnboardingQuestion[];
  answeredCount: number;
  maturityLabel: CloneMaturity;
}> {
  const response = await fetchWithTimeout("/api/onboarding/questions", {
    credentials: "include",
  });
  return parseJson(response);
}

export async function submitOnboardingAnswer(input: {
  questionId: string;
  answer: string;
  driver?: DriverChip;
}): Promise<{
  storedSummary: string;
  maturityLabel: CloneMaturity;
  answeredCount: number;
}> {
  const response = await fetch("/api/onboarding/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const result = await parseJson<{
    storedSummary: string;
    maturityLabel: CloneMaturity;
    answeredCount: number;
  }>(response);
  invalidateCache("dashboard");
  invalidateCache("memories");
  return result;
}

export async function completeOnboarding(): Promise<{ maturityLabel: CloneMaturity }> {
  const response = await fetch("/api/onboarding/complete", {
    method: "POST",
    credentials: "include",
  });
  return parseJson(response);
}

export async function fetchTelegramLinkUrl(): Promise<{
  url: string;
  expiresIn: number;
}> {
  const response = await fetch("/api/telegram/link-token", {
    method: "POST",
    credentials: "include",
  });
  return parseJson(response);
}

export async function fetchTelegramStatus(): Promise<{
  linked: boolean;
  notificationsEnabled: boolean;
  botConfigured: boolean;
}> {
  const response = await fetchWithTimeout("/api/telegram/status", {
    credentials: "include",
  });
  return parseJson(response);
}

export async function fetchTelegramHistory(): Promise<{
  messages: Array<{
    id: string;
    matchId: string | null;
    messageType:
      | "live_goal"
      | "post_match_roast"
      | "post_match_congrats"
      | "on_demand_roast";
    body: string;
    metadata: Record<string, unknown>;
    sentAt: string;
    recallSource?: "walrus" | "postgres_fallback" | "none";
    citationSource?: "llm" | "enforced";
    citationWarnings?: string[];
    citedMemories: Array<{
      id?: string;
      text: string;
      type?: string;
      source?: string;
      walrusBlobId?: string;
      recallSource?: "walrus" | "postgres_fallback";
      citationSource?: "llm" | "enforced";
    }>;
    recalledMemories: Array<{
      id?: string;
      textExcerpt: string;
      type?: string;
      source?: string;
      score?: number;
      finalScore?: number;
      recallSource?: "walrus" | "postgres_fallback";
      walrusBlobId?: string;
    }>;
    match: {
      externalId: string;
      teamACode: string | null;
      teamBCode: string | null;
      scoreA: number | null;
      scoreB: number | null;
    } | null;
  }>;
}> {
  const response = await fetchWithTimeout("/api/telegram/history", {
    credentials: "include",
  });
  return parseJson(response);
}

export async function fetchMemoriesRaw(): Promise<{
  memories: MemoryReceipt[];
  backend: "Local" | "Walrus";
}> {
  const response = await fetchWithTimeout("/api/memories", {
    credentials: "include",
  });
  return parseJson(response);
}

export async function fetchMemories(userId?: string): Promise<{
  memories: MemoryReceipt[];
  backend: "Local" | "Walrus";
}> {
  if (!userId) return fetchMemoriesRaw();
  return fetchCached(cacheKeys.memories(userId), fetchMemoriesRaw);
}

export async function fetchMemoryHealth(): Promise<{
  ok: boolean;
  backend: "Local" | "Walrus";
  configured?: boolean;
  message?: string;
}> {
  const response = await fetchWithTimeout(
    "/api/memories/health",
    { credentials: "include" },
    8000,
  );
  return parseJson(response);
}

export async function retryMemoryWrite(memoryId: string): Promise<{
  status: string;
  backend: "Local" | "Walrus";
}> {
  const response = await fetch("/api/memories/retry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ memoryId }),
  });
  return parseJson(response);
}

export async function fetchMemoryUnlockChallenge(walletAddress?: string): Promise<{
  message: string;
  challengeToken: string;
  expiresIn: number;
}> {
  const response = await fetchWithTimeout("/api/auth/memory-challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(walletAddress ? { walletAddress } : {}),
  });
  return parseJson(response);
}

export async function decryptMemories(
  memoryIds: string[],
  signMessage: (message: string) => Promise<string>,
  walletAddress?: string,
): Promise<Record<string, string>> {
  const challenge = await fetchMemoryUnlockChallenge(walletAddress);
  const signature = await signMessage(challenge.message);
  const response = await fetchWithTimeout("/api/memories/decrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      challengeToken: challenge.challengeToken,
      signature,
      memoryIds,
    }),
  });
  const data = await parseJson<{ decrypted: Record<string, string> }>(response);
  return data.decrypted;
}

export type MatchesResponse = {
  matches: Match[];
  predictedMatchIds: string[];
};

export async function fetchMatchesRaw(): Promise<MatchesResponse> {
  const response = await fetchWithTimeout("/api/matches", {
    credentials: "include",
  });
  const data = await parseJson<{
    matches: Match[];
    predictedMatchIds?: string[];
  }>(response);
  return {
    matches: data.matches,
    predictedMatchIds: data.predictedMatchIds ?? [],
  };
}

export async function fetchMatches(): Promise<Match[]> {
  const data = await fetchCached(cacheKeys.matches(), fetchMatchesRaw, 45_000);
  return data.matches;
}

export async function fetchMatchRaw(matchId: string): Promise<Match> {
  const response = await fetchWithTimeout(`/api/matches/${matchId}`);
  return parseJson<Match>(response);
}

export async function fetchMatch(matchId: string): Promise<Match> {
  return fetchCached(cacheKeys.match(matchId), () => fetchMatchRaw(matchId), 120_000);
}

export type PredictionHistoryItem = {
  prediction: Prediction;
  match: Match;
  savedAt: string;
  matchResult?: {
    status: string;
    winner: string | null;
    scoreA: number | null;
    scoreB: number | null;
  };
};

export async function fetchMatchPredictionRaw(
  matchId: string,
): Promise<Prediction | null> {
  const response = await fetchWithTimeout(
    `/api/matches/${matchId}/prediction`,
    { credentials: "include" },
  );
  if (response.status === 401) return null;
  const data = await parseJson<{ prediction: Prediction | null }>(response);
  return data.prediction;
}

export async function fetchMatchPrediction(
  matchId: string,
  userId?: string,
): Promise<Prediction | null> {
  if (!userId) return fetchMatchPredictionRaw(matchId);
  return fetchCached(cacheKeys.matchPrediction(userId, matchId), () =>
    fetchMatchPredictionRaw(matchId),
  );
}

export async function submitMatchPrediction(
  matchId: string,
  input: {
    winner: string;
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning?: string;
    emotion?: EmotionState;
  },
): Promise<Prediction> {
  const response = await fetch(`/api/matches/${matchId}/prediction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ prediction: Prediction }>(response);
  invalidateCache("match-pred");
  invalidateCache("dashboard");
  invalidateCache("history");
  invalidateCache("matches");
  return data.prediction;
}

export async function fetchPredictionHistoryRaw(): Promise<PredictionHistoryItem[]> {
  const response = await fetchWithTimeout("/api/predictions/history", {
    credentials: "include",
  });
  if (response.status === 401) return [];
  const data = await parseJson<{ history: PredictionHistoryItem[] }>(response);
  return data.history;
}

export async function fetchPredictionHistory(
  userId?: string,
): Promise<PredictionHistoryItem[]> {
  if (!userId) return fetchPredictionHistoryRaw();
  return fetchCached(cacheKeys.predictionHistory(userId), fetchPredictionHistoryRaw);
}

export async function fetchClonePredictionRaw(
  matchId: string,
): Promise<{
  clone: NonNullable<Prediction["clone"]> | null;
  trainingQuestion: string | null;
} | null> {
  const response = await fetchWithTimeout(
    `/api/matches/${matchId}/clone-prediction`,
    { credentials: "include" },
  );
  if (response.status === 401) return null;
  return parseJson(response);
}

export async function generateClonePrediction(matchId: string): Promise<{
  clone: NonNullable<Prediction["clone"]>;
  trainingQuestion: string | null;
  weakMemory: boolean;
  prediction: Prediction | null;
}> {
  const response = await fetch(`/api/matches/${matchId}/clone-prediction`, {
    method: "POST",
    credentials: "include",
  });
  const data = await parseJson<{
    clone: NonNullable<Prediction["clone"]>;
    trainingQuestion: string | null;
    weakMemory: boolean;
    prediction: Prediction | null;
  }>(response);
  invalidateCache("match-pred");
  return data;
}

export async function fetchDashboardRaw(): Promise<DashboardData | null> {
  const response = await fetchWithTimeout("/api/dashboard", {
    credentials: "include",
  });
  if (response.status === 401) return null;
  return parseJson<DashboardData>(response);
}

export async function fetchDashboard(
  userId?: string,
): Promise<DashboardData | null> {
  if (!userId) return fetchDashboardRaw();
  return fetchCached(cacheKeys.dashboard(userId), fetchDashboardRaw);
}

export type PublicProfileResponse = PublicProfileData;

export async function fetchPublicProfile(
  slug: string,
): Promise<PublicProfileResponse | null> {
  const response = await fetch(`/api/u/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  return parseJson<PublicProfileResponse>(response);
}

export async function fetchDebateOpening(options?: {
  variantIndex?: number;
}): Promise<DebateMessage> {
  const params = new URLSearchParams();
  if (options?.variantIndex !== undefined) {
    params.set("variant", String(options.variantIndex));
  }
  const query = params.toString();
  const response = await fetch(
    `/api/debate/opening${query ? `?${query}` : ""}`,
    { credentials: "include" },
  );
  const data = await parseJson<{ message: DebateMessage }>(response);
  return data.message;
}

export async function saveDebateHighlight(input: {
  messages: DebateMessage[];
}): Promise<{ saved: boolean; memoryId?: string; status?: string }> {
  const response = await fetch("/api/debate/highlight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function sendEvolutionChatMessage(input: {
  phaseId: "day1" | "day3" | "day4" | "day7";
  message: string;
  recentMessages?: DebateMessage[];
}): Promise<{
  reply: DebateMessage;
  meta: { memoryCount: number; maturityLabel: string; phaseLabel: string };
}> {
  const response = await fetch("/api/evolution/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function sendDebateMessage(input: {
  message: string;
  recentMessages?: DebateMessage[];
}): Promise<DebateMessage> {
  const response = await fetch("/api/debate/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ reply: DebateMessage }>(response);
  return data.reply;
}

export async function submitDebateCorrection(input: {
  correction: string;
  wrongMemoryId?: string;
}): Promise<{ memoryId: string; storageStatus: string }> {
  const response = await fetch("/api/debate/correction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export type { BiasAxis, EvolutionEvent, PredictionComparison };

export async function submitCloneCorrection(
  matchId: string,
  input: {
    correction: string;
    wrongMemoryId?: string;
    regenerate?: boolean;
  },
): Promise<{
  memoryId: string;
  storageStatus: string;
  clone?: NonNullable<Prediction["clone"]>;
  prediction?: Prediction;
  agreed?: boolean;
  regenerated: boolean;
}> {
  const response = await fetch(`/api/matches/${matchId}/clone-correction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await parseJson<{
    memoryId: string;
    storageStatus: string;
    clone?: NonNullable<Prediction["clone"]>;
    prediction?: Prediction;
    agreed?: boolean;
    regenerated: boolean;
  }>(response);
  invalidateCache("match-pred");
  return data;
}

export async function generateClashDebate(input: {
  slugA: string;
  slugB: string;
  matchId: string;
}): Promise<ClashDebateResult> {
  const response = await fetchWithTimeout(
    "/api/clash/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    90_000,
  );
  return parseJson<ClashDebateResult>(response);
}

export async function fetchWalrusBlobProof(
  blobId: string,
): Promise<WalrusBlobProof> {
  const response = await fetchWithTimeout(
    `/api/walrus/blobs/${encodeURIComponent(blobId)}`,
    undefined,
    20_000,
  );
  return parseJson<WalrusBlobProof>(response);
}
