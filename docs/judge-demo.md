# Judge Demo

The **judge demo** is a no-wallet proof surface for Walrus Memory World Cup judges. It loads a pre-seeded clone with **10 Mainnet Walrus receipts**, lets you audit memory-driven behavior on one page, write a live correction blob, and clash two isolated namespaces — without connecting a wallet or running onboarding.

**Primary URL:** [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution)  
**Sidebar:** Judge demo → Evolution (public proof)

For the full 15-minute tour and criteria map, see [Judges Guide](./judges.md). For recording tips, see [Demo Guide](./demo-guide.md).

---

## What judges see

| Panel | What it proves |
|-------|----------------|
| **Why this page exists** | One-scroll explainer — no wallet, proof not marketing |
| **Same Question — Two Answers** | Day 1 generic draw vs Day 4+ Portugal pick citing Walrus receipts |
| **Memory Provenance** | Blob IDs, dates, sources (last 4 days) |
| **Correction Override Proof** | Stale take disputed → correction stored → clone cites new memory |
| **Live judge sandbox** | Apply correction → real Walrus blob → regenerate clone with cited receipts |
| **Evolution chat** | Phase-aware clone replies (Day 1 / 3 / 4 / 7) with memory citations |
| **Roast my record** | Post-match summaries that feed the next recall |
| **Memory Time Machine** | Day 1 → Day 7 clone state reconstructed from stored memories |

If panels show **Illustrative fallback** (amber), Walrus demo seed is missing — run `npm run db:seed-demo-walrus` on production.

---

## Seeded demo accounts

Two public profiles are created by `npm run db:seed-demo` and upgraded to Mainnet with the Walrus seed scripts. They are **curated fan narratives** backed by **real Walrus Mainnet blobs** after seeding.

### Demo fan — `hoolclone-demo`

| Field | Value |
|-------|-------|
| **Profile URL** | [/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo) |
| **Evolution (judge page)** | [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) |
| **Display name** | Demo Fan |
| **Public slug** | `hoolclone-demo` |
| **Wallet (seed only)** | `0x0000000000000000000000000000000000000000000000000000000000demo01` |
| **Walrus namespace** | `hoolclone:demo:hoolclone-demo` |
| **Favorite team** | Portugal |
| **Rival team** | Brazil |
| **Prediction style** | vibes |
| **Clone maturity** | Level 4 (Contradiction Hunter) |
| **Seeded memories** | **10** (`DEMO_MEMORIES` in `lib/db/demo-memories.ts`) |
| **Featured match** | `m071` — Colombia vs Portugal |

Memory themes: Portugal loyalty, vibes-over-stats, Brazil skepticism, user correction overriding xG doubt, COL vs POR prediction receipts, post-match Telegram summary.

One memory (`telegram_post_match` on `m071`) is **private** (`public_visible = false`) — judges see it in evolution/roast panels but not on the public receipt grid.

### Rival fan — `hoolclone-rival`

| Field | Value |
|-------|-------|
| **Profile URL** | [/u/hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-rival) |
| **Display name** | Rival Fan |
| **Public slug** | `hoolclone-rival` |
| **Wallet (seed only)** | `0x0000000000000000000000000000000000000000000000000000000000demo02` |
| **Walrus namespace** | `hoolclone:demo:hoolclone-rival` |
| **Favorite team** | Colombia |
| **Rival team** | Portugal |
| **Prediction style** | chaos |
| **Clone maturity** | Level 3 |
| **Seeded memories** | **10** (`RIVAL_MEMORIES` in `lib/db/demo-memories.ts`) |
| **Featured match** | `m071` — picks Colombia 2-1 |

Built to **clash** with the demo fan: Colombia-first chaos picker vs Portugal loyalty fan. Both appear on the arena leaderboard with the **Live Mainnet Walrus** badge.

### Clone Clash URL

[/u/hoolclone-demo/clash?opponent=hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival)

Two isolated Walrus namespaces debate with memory receipts — no shared fine-tuned model.

---

## Seed commands

| Command | What it does |
|---------|--------------|
| `npm run db:seed-demo` | Creates both users + profiles + **10 memories each** with placeholder blob IDs (`demo-blob-*`, `rival-blob-*`) |
| `npm run db:seed-demo-walrus` | Uploads demo fan memories to Walrus Mainnet (~5–6 min) |
| `npm run db:seed-demo-rival-walrus` | Uploads rival fan memories to Walrus Mainnet (~7 min) |
| `npm run db:seed-demo-walrus:resume` | Resume interrupted demo uploads |
| `npm run db:seed-demo-rival-walrus:resume` | Resume interrupted rival uploads |
| `npm run verify:mainnet` | Confirms **10+ real blobs** per account, zero placeholders |

Source: `lib/db/seed-demo-user.ts`, `lib/db/seed-demo-rival.ts`, `scripts/seed-demo-walrus.ts`, `scripts/seed-demo-rival-walrus.ts`.

---

## Live judge sandbox (no wallet)

On [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution), scroll to **Live judge sandbox**:

1. **Apply correction** — writes a real `correction` memory for match `m071` (Colombia vs Portugal) to the demo Walrus namespace
2. Note the **memory ID** and **blob ID** in the confirmation panel
3. **Regenerate clone prediction** — clone recalls the new correction and shows cited receipt cards

Fixed correction text (from `lib/judge-demo/constants.ts`):

> "I trust Portugal in tight games — loyalty matters more than xG."

This uses the same `storeCloneCorrection` + `generateClonePrediction` path as the logged-in predict flow, but scoped to the demo user via public API routes.

---

## Judge demo API routes

Public routes under `/api/judge-demo/*` — **no session required**. All resolve the demo user by slug `hoolclone-demo`.

| Method | Path | Rate limit (per IP / hour) | Description |
|--------|------|---------------------------|-------------|
| `GET` | `/api/judge-demo/state` | — | Current human + clone prediction for `m071` |
| `POST` | `/api/judge-demo/correct` | 8 | Write live correction to Walrus |
| `POST` | `/api/judge-demo/regenerate` | 12 | Regenerate clone prediction with cited receipts |
| `POST` | `/api/judge-demo/evolution-chat` | 40 | Phase-aware evolution chat reply (Gemini or fallback) |

**Evolution chat request body:**

```json
{
  "phaseId": "day4",
  "message": "Who wins Colombia vs Portugal?",
  "recentMessages": []
}
```

`phaseId` is one of `day1`, `day3`, `day4`, `day7`.

**Correction response (abbreviated):**

```json
{
  "memoryId": "uuid",
  "storageStatus": "stored",
  "walrusBlobId": "…",
  "walrusNamespace": "hoolclone:demo:hoolclone-demo",
  "correctionText": "I trust Portugal in tight games — loyalty matters more than xG."
}
```

See [API Reference](./api-reference.md#judge-demo-public) for full shapes.

---

## UI entry points

| Location | Link |
|----------|------|
| Sidebar → **Judge demo** | `/u/hoolclone-demo/evolution` |
| Evolution page explainer | Links to live sandbox, Clone Clash, Telegram history, `/docs/judges` |
| Arena featured matchups | **Judge clash** → demo vs rival |
| Public profile share | `/u/hoolclone-demo` with share card |

---

## Unit test coverage

Judge demo logic is covered offline — no Walrus or Gemini calls in tests:

| Module | Test file | What it covers |
|--------|-----------|----------------|
| Judge proof panels | `lib/clone/judge-proof-demo.test.ts` | Same-question proof, correction override, roast record |
| Featured arena + clash href | `lib/clash/featured-arena-opponents.test.ts` | Demo/rival slugs, `buildJudgeDemoClashHref` |
| Showcase match picker | `lib/clone/clone-showcase.test.ts` | Featured `m071` preference for evolution panels |
| Share on X intent | `lib/profile/open-share-on-x.test.ts` | Public profile share URL builder |

Full suite: **220 tests** · **54 files** · **100 suites** — run `npm test`. See [Test Coverage](./test-coverage.md).

---

## Operator checklist

Before judging or recording:

- [ ] `npm run verify:mainnet` — 10+ demo blobs, 10+ rival blobs, zero `demo-blob-*` / `rival-blob-*` placeholders
- [ ] [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) shows **Public judge proof** (not illustrative fallback)
- [ ] Live sandbox writes a blob and regenerates with receipts
- [ ] Clone Clash loads both participants with Walrus memory counts
- [ ] `npm test` — all **220** tests pass

---

## Related docs

- [Judges Guide](./judges.md) — 15-minute tour and criteria map
- [Demo Guide](./demo-guide.md) — 3-minute video script and recording tips
- [Walrus Memory](./walrus-memory.md) — namespaces and seed scripts
- [Deployment](./deployment.md) — production Mainnet setup
- [API Reference](./api-reference.md) — all `/api` routes
- [Test Coverage](./test-coverage.md) — flow-by-flow test map
