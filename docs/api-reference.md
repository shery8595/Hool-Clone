# API Reference

HoolClone exposes REST API routes under `/api`. Most endpoints require a wallet session cookie obtained via the auth flow below.

**Base URL (production):** `https://walrus-mu.vercel.app`

---

## Authentication

### 1. Request challenge

```http
POST /api/auth/challenge
Content-Type: application/json

{ "walletAddress": "0x..." }
```

Returns a `challengeToken` and message to sign.

### 2. Verify signature

```http
POST /api/auth/wallet
Content-Type: application/json

{
  "walletAddress": "0x...",
  "challengeToken": "...",
  "signature": "..."
}
```

Sets an HTTP-only session cookie on success.

### Memory unlock (encrypted emotional memories)

```http
POST /api/auth/memory-challenge
```

Returns a `challengeToken` and message to sign with the user's wallet (separate from login challenge).

```http
POST /api/memories/decrypt
Content-Type: application/json

{
  "memoryId": "uuid",
  "challengeToken": "...",
  "signature": "..."
}
```

Returns decrypted plaintext for UI display on `/memory` only. Clone recall uses search surrogates and does not call this route.

### Session endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/me` | Session | Current user + profile + maturity |
| `DELETE` | `/api/me` | Session | Log out (clear session) |
| `PATCH` | `/api/me/profile` | Session | Update display name, teams, tone |
| `POST` | `/api/me/public-profile` | Session | Enable/configure public slug |

---

## Onboarding (Train)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/onboarding/questions` | Session | Question bank for interview |
| `POST` | `/api/onboarding/answer` | Session | Save answer + extract + write Walrus memories |
| `POST` | `/api/onboarding/complete` | Session | Mark onboarding complete |

**`POST /api/onboarding/answer` body:**

```json
{
  "questionId": "favorite_team",
  "answer": "Brazil — always, even when they're struggling"
}
```

Writes structured facts via Gemini extraction; each fact becomes a `remember()` call.

---

## Matches and predictions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/matches` | Optional | All fixtures with status/scores |
| `GET` | `/api/matches/:matchId` | Optional | Single match detail |
| `GET` | `/api/matches/:matchId/prediction` | Session | User's prediction for match |
| `POST` | `/api/matches/:matchId/prediction` | Session | Submit human prediction + write memory |
| `GET` | `/api/matches/:matchId/clone-prediction` | Session | Latest clone prediction |
| `POST` | `/api/matches/:matchId/clone-prediction` | Session | Generate clone prediction |
| `POST` | `/api/matches/:matchId/clone-correction` | Session | Correct clone after disagreement |
| `GET` | `/api/predictions/history` | Session | User prediction history |

**`POST /api/matches/:matchId/prediction` body:**

```json
{
  "predictedWinner": "BRA",
  "predictedScoreA": 2,
  "predictedScoreB": 1,
  "confidence": 75,
  "reasoning": "Neymar magic in knockouts",
  "emotionalState": "hopeful"
}
```

---

## Memories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/memories` | Session | List user memories + backend label |
| `GET` | `/api/memories/health` | Session | Walrus/MemWal health for current user |
| `POST` | `/api/memories/retry` | Session | Retry failed Walrus writes |
| `POST` | `/api/memories/decrypt` | Session + wallet sig | Decrypt one encrypted emotional memory for UI |

**`GET /api/memories` response:**

```json
{
  "memories": [{ "id", "text", "type", "walrusBlobId", "storageStatus", ... }],
  "backend": "walrus"
}
```

---

## Debate

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/debate/opening` | Session | Clone opening message for debate |
| `POST` | `/api/debate/chat` | Session | Send message; clone replies with receipts |
| `POST` | `/api/debate/correction` | Session | Store user correction as memory |
| `POST` | `/api/debate/highlight` | Session | Save debate highlight for public profile |

---

## Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/dashboard` | Session | Dashboard aggregate (matches, stats, mood) |

---

## Public profiles

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/u/:slug` | None | Public profile JSON |
| `GET` | `/u/:slug` | None | Public profile page (SSR) |

Public pages work without authentication. Memory receipts respect `public_visible` flags.

---

## Clone Clash

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/clash/generate` | Optional | Generate clash debate turn between two namespaces |

Used by `/u/:slug/clash?opponent=<rival-slug>` for cross-user memory debates.

---

## Judge demo (public)

No authentication. All routes resolve the seeded demo user (`hoolclone-demo`). See [Judge Demo](./judge-demo.md) for account details and operator checklist.

| Method | Path | Rate limit (per IP / hour) | Description |
|--------|------|---------------------------|-------------|
| `GET` | `/api/judge-demo/state` | — | Human + clone prediction for featured match `m071` |
| `POST` | `/api/judge-demo/correct` | 8 | Write live correction memory to Walrus |
| `POST` | `/api/judge-demo/regenerate` | 12 | Regenerate clone prediction with cited receipts |
| `POST` | `/api/judge-demo/evolution-chat` | 40 | Phase-aware evolution chat reply |

**`POST /api/judge-demo/evolution-chat` body:**

```json
{
  "phaseId": "day4",
  "message": "Who wins Colombia vs Portugal?",
  "recentMessages": []
}
```

`phaseId`: `day1` | `day3` | `day4` | `day7`

**`POST /api/judge-demo/correct` response (abbreviated):**

```json
{
  "memoryId": "uuid",
  "storageStatus": "stored",
  "walrusBlobId": "…",
  "walrusNamespace": "hoolclone:demo:hoolclone-demo",
  "correctionText": "I trust Portugal in tight games — loyalty matters more than xG."
}
```

Returns `429` with `Retry-After` when rate limited. Returns `404` if demo user is not seeded.

---

## Walrus blobs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/walrus/blobs/:blobId` | None | Proxy blob metadata from Walrus aggregator |

---

## Telegram

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/telegram/link-token` | Session | Issue deep-link JWT for bot connect |
| `GET` | `/api/telegram/status` | Session | `{ linked, notificationsEnabled }` |
| `GET` | `/api/telegram/history` | Session | Sent DMs with recall snapshots |
| `POST` | `/api/telegram/webhook` | Telegram | grammy webhook (not for direct use) |

---

## Cron and admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/cron/check-resolutions` | `Bearer CRON_SECRET` | Sync scores + Telegram + resolution memories |
| `GET` | `/api/cron/memory-consolidation` | `Bearer CRON_SECRET` | Sleep-cycle merge → `consolidated_bias` + archive |
| `POST` | `/api/admin/sync-matches` | `Bearer CRON_SECRET` | Manual score sync |
| `POST` | `/api/admin/seed-matches` | Dev / admin | Re-seed fixtures |
| `GET` | `/api/admin/memwal-health` | `ADMIN_SECRET` or dev | MemWal + relayer health |

**Cron response shape:**

```json
{
  "sync": { "updated": 3, "liveGoals": 1 },
  "live": { "sent": 2 },
  "telegram": { "postMatch": 1 },
  "resolution": { "memoriesWritten": 5 }
}
```

---

## Error responses

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid session |
| `400` | Validation error (Zod) |
| `404` | Resource not found |
| `500` | Server error |

Standard error body:

```json
{ "error": "Human-readable message" }
```

---

## Rate limiting

Clone generation, debate, and memory writes are bounded per user session. Excessive requests return `429` or graceful degradation (template fallbacks for Telegram).

---

## Related docs

- [How It Works](./how-it-works.md) — what each endpoint does at runtime
- [Walrus Memory](./walrus-memory.md) — memory write/recall internals
- [Deployment](./deployment.md) — env vars for API dependencies
