# Judges Guide

A **15-minute walkthrough** for Walrus Memory World Cup judges. HoolClone is a World Cup 2026 dApp where an AI fan clone learns from durable Walrus memories — not model fine-tuning — and visibly changes behavior over time.

**Production:** [https://walrus-mu.vercel.app](https://walrus-mu.vercel.app)  
**Repo:** [github.com/shery8595/Hool-Clone](https://github.com/shery8595/Hool-Clone)  
**Web docs:** [/docs/judges](/docs/judges)

> **One-line pitch:** HoolClone doesn't predict football — it predicts *you*. Every take is a Walrus Mainnet receipt; the clone recalls them before every prediction, debate, and roast.

---

## Seeded demo accounts

| Account | Slug | Memories | Namespace | Role |
|---------|------|----------|-----------|------|
| **Demo Fan** | `hoolclone-demo` | 10 | `hoolclone:demo:hoolclone-demo` | Portugal loyalty fan — judge evolution + live sandbox |
| **Rival Fan** | `hoolclone-rival` | 10 | `hoolclone:demo:hoolclone-rival` | Colombia chaos fan — Clone Clash opponent |

Full account details, wallets, seed commands, and API routes: [Judge Demo](./judge-demo.md).

---

## Bookmark these URLs

| What | URL |
|------|-----|
| **Demo profile** (10 Mainnet memories) | [/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo) |
| **Evolution page** (start here — public judge proof) | [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) |
| **Judge demo reference** (accounts, API, seeds) | [/docs/judge-demo](/docs/judge-demo) |
| **Live judge sandbox** (no wallet — writes real correction) | Scroll to **Live judge sandbox** on evolution page |
| **Logged-in evolution** (same UI, your wallet) | [/evolution](https://walrus-mu.vercel.app/evolution) |
| **Memory browser** (encrypted takes + lineage) | [/memory](https://walrus-mu.vercel.app/memory) *(wallet required)* |
| **Clone Clash** (two Walrus namespaces) | [/u/hoolclone-demo/clash?opponent=hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival) |
| **Telegram roast cards** (public demo) | [/u/hoolclone-demo/telegram-history](https://walrus-mu.vercel.app/u/hoolclone-demo/telegram-history) |
| **MemWal health** (public) | [/api/health/memwal](https://walrus-mu.vercel.app/api/health/memwal) |
| **Live predict** *(wallet required)* | [/predict](https://walrus-mu.vercel.app/predict) |
| **Documentation** | [/docs](/docs) |

> **Note:** `/u/hoolclone-demo/evolution` is the **public evolution page** for the seeded demo account — the same layout and panels as `/evolution` for a logged-in user, pre-loaded so judges can review memory proof without training a clone.

---

## 15-minute judge tour

### Step 1 — Evolution page (5 min) ★ start here

Open [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution). Header reads **Public judge proof**. This page bundles the strongest memory proofs:

| Panel | What it proves |
|-------|----------------|
| **Same Question — Two Answers** | Day 1 clone had no receipts (generic draw). Day 4+ clone cites a Walrus correction memory and picks Portugal with confidence. |
| **Memory Provenance** | Table of memories with blob IDs, dates, and sources (last 4 days). |
| **Correction Override Proof** | Stale take disputed → correction memory on Mainnet → clone cites that blob (badge: **Live Walrus proof**) |
| **Live judge sandbox** | **No wallet** — click Apply correction → real Walrus blob → Regenerate clone with cited receipts |
| **Roast my record** | Post-match summaries that feed the next recall |
| **Memory Time Machine** | Day 1 → Day 7 clone state derived from the same Walrus receipts in the provenance table |

If panels show **Illustrative fallback** (amber), Walrus demo seed is missing — production should show **live** data after `db:seed-demo-walrus`.

### Step 2 — Memory receipts on profile (3 min)

Open [/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo). Expand any memory card:

- **Verified on Walrus Mainnet** — truncated blob ID, full ID on hover, explorer link
- **Demo placeholder — not on Mainnet** (amber) — should be **zero** on production

Top bar shows **Walrus: Verified** when Mainnet recall is healthy.

### Step 3 — Live judge sandbox (2 min)

On the evolution page, scroll to **Live judge sandbox**:

1. Click **Apply correction** — writes a real `correction` memory to Walrus for the demo namespace
2. Note the **memory ID** and **blob ID**
3. Click **Regenerate clone prediction** — clone cites the new correction receipt

No wallet required. Rate-limited for abuse protection.

### Step 4 — Predict with cited recall (optional, wallet)

Go to [/predict](https://walrus-mu.vercel.app/predict) **after connecting your wallet**, open a match, submit your pick, then generate the clone prediction.

Look for:

- **Memory receipt cards** — each maps to a recalled memory with source label (`Your correction · N days ago`, `telegram_post_match`, etc.)
- **Recall backend badge** — `Walrus: Verified recall` vs `Postgres fallback recall` (UI is honest about fallback)
- **Clone mood badge** — `On Fire`, `Salty`, `Loyalist`, etc. (derived from prediction history + memory drivers)

### Step 5 — Clone Clash (2 min)

Open [Clone Clash vs rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival). Participant cards show **Walrus memory count** before debate; pick a match and **Start clash debate** to see recalled receipts in the transcript. Two isolated Walrus namespaces — memory-only cross-user debate.

### Step 6 — Closed loop + memory ops (1 min)

Skim [/u/hoolclone-demo/telegram-history](https://walrus-mu.vercel.app/u/hoolclone-demo/telegram-history). Post-match congrats/roasts cite memories; each DM triggers a `telegram_post_match` Walrus write that shapes the **next** clone `recall()`.

Production crons (both via [cron-job.org](./cron-job.md), `Authorization: Bearer CRON_SECRET`):

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Match sync + Telegram | Every 1 min | `GET /api/cron/check-resolutions` |
| Sleep-cycle consolidation | Every 6 hours | `GET /api/cron/memory-consolidation` |

The consolidation job merges repetitive prediction memories into `consolidated_bias` blobs and archives superseded index rows (original Walrus blobs stay on Mainnet).

### Optional — Encrypted memories (`/memory`)

Connect wallet → [/memory](https://walrus-mu.vercel.app/memory). Onboarding **emotional_memory** facts are encrypted on Walrus (`enc:v1:`) with a public search surrogate for clone recall. Lock badge → wallet unlock → plaintext for UI only; the clone never needs unlock to predict.

---

## Judging criteria map

### Memory Depth & Authenticity

| Criterion | Proof | Where |
|-----------|-------|-------|
| Behavior changes over sessions | Same question, two answers (Day 1 vs Day 4+) | Evolution → **Same Question — Two Answers** |
| Verifiable storage | Real `walrusBlobId` on Mainnet | Any memory card on demo profile |
| Memory shapes output | Clone cites recalled receipts, not fabricated IDs | `/predict/[matchId]` receipt cards |
| Corrections override stale takes | Disputed memory → correction → regenerated prediction | Evolution → **Correction Override** + **Live judge sandbox** |
| Live Walrus write without wallet | Apply correction → blob ID → regenerate | Evolution → **Live judge sandbox** |
| Post-match learning | Roast/congrats write `prediction_history_summary` | `/u/hoolclone-demo/telegram-history` + evolution roast section |
| Memory consolidation | Repetitive takes merge into `consolidated_bias` | [Cron job](./cron-job.md) · `/memory` lineage |
| Selective privacy | Emotional memories encrypted; recall uses surrogates | `/memory` unlock flow |

### Creativity & Flair

| Criterion | Proof | Where |
|-----------|-------|-------|
| Memory-only cross-user feature | Two namespaces debate | **Clone Clash** |
| Human vs clone leaderboard | Accuracy comparison | Dashboard + evolution analytics |
| Screenshot-ready roasts | Styled cards with memory citations | `/telegram-history` |
| Personality from memory | Clone mood drives LLM tone | Dashboard + predict mood badge |

### Technical Execution & Completeness

| Criterion | Proof | Where |
|-----------|-------|-------|
| Walrus integration visible | Status badges in UI | Sidebar, top bar, predict panel |
| Honest fallback labeling | Postgres fallback shown explicitly | Receipt cards when Walrus unavailable |
| Mainnet verification CLI | Scripted readiness checks | `npm run verify:mainnet` |
| Public MemWal health | No auth required | `/api/health/memwal` |
| Production deployment | Live app + documented env | [walrus-mu.vercel.app](https://walrus-mu.vercel.app) |
| Unit test coverage | 220 tests · 54 files · 100 suites | [Test Coverage](./test-coverage.md) |
| Dual production crons | Match loop + sleep-cycle consolidation | [Production Cron](./cron-job.md) |

---

## Memory authenticity (the 4-day criterion)

Hackathon rules ask for behavior that **could not have happened on day one** — after at least four days of use. HoolClone proves this in three inspectable ways:

1. **Timestamps** — Memory Provenance lists real `created_at` dates spanning multiple days. Day 4+ answers cite memories written days earlier.
2. **Same Question — Two Answers** — Identical prompt; Day 1 clone has no receipts (generic draw). Day 4+ clone recalls stored loyalty/correction memories and picks Portugal with cited blob IDs.
3. **Live judge sandbox** — You write a **new** correction blob in this session, regenerate, and watch the clone cite it. That before/after cannot exist without Walrus memory.

The demo compresses a multi-day journey onto one page for judges. The **narrative is curated**; the **blobs, recall, and behavior change are real**.

---

## What is real vs curated

| Layer | Status |
|-------|--------|
| Walrus blob IDs on demo profile | **Real Mainnet** after `db:seed-demo-walrus` |
| Recall before predict / debate / roast | **Real** vector search when Walrus healthy; UI labels fallback |
| Day 1 vs Day 4+ clone answers | **Real** — driven by which memories exist at each maturity phase |
| Live sandbox correction write | **Real** — new Mainnet blob in the current session |
| Fan narrative (loyalty, rival grudges) | **Curated copy** for judging clarity |
| Evolution time machine panels | **Derived** from stored memories you can inspect (not replayed chat logs) |
| LLM text | **Gemini** when `GEMINI_API_KEY` set; templates when unavailable |
| Encrypted emotional memories | **Real** encryption at write; unlock is wallet-gated for UI |
| Consolidated biases | **Real** cron job on production; demo may show lineage after consolidation runs |

Every memory receipt on production is a **real Walrus Mainnet blob**. Panels show **Live Walrus proof** when seeded correctly; **Illustrative fallback** means run `db:seed-demo-walrus`.

---

## CLI verification (optional)

Judges with repo access can confirm Mainnet readiness:

```bash
git clone https://github.com/shery8595/Hool-Clone.git
cd Hool-Clone
npm install
npm run verify:mainnet
```

Expected: all checks pass, 10+ demo blobs, 10+ rival blobs, zero `demo-blob-*` placeholders.

Run the test suite offline:

```bash
npm test   # 220 tests, 100 suites — no external services
```

Manual consolidation demo (operators):

```bash
npm run consolidate:demo
```

---

## Three-minute video script

For demo video recording, see [Demo Guide](./demo-guide.md). Core beats (authenticity first):

1. Pitch — "predicts you, not football"
2. **Live judge sandbox** — Apply correction → zoom blob ID → Regenerate → cited receipt
3. Same Question — Two Answers + Memory Provenance (Day 1 vs Day 4+, multi-day blob IDs)
4. Clone Clash — two namespaces
5. Telegram roast cards — `/u/hoolclone-demo/telegram-history`

---

## Deep dives (if you have more time)

| Topic | Doc |
|-------|-----|
| How Walrus is used in every flow | [How Walrus Memory Is Used](./how-walrus-memory-is-used.md) |
| How memory improves the agent | [How Memory Improves the Agent](./how-memory-improves-agent.md) |
| Walrus write/recall, encryption, consolidation | [Walrus Memory](./walrus-memory.md) |
| Production cron setup | [Production Cron](./cron-job.md) |
| Full architecture | [Architecture](./hoolclone-architecture.md) |

---

## Related docs

- [Judge Demo](./judge-demo.md) — demo and rival accounts, live sandbox API, seeds
- [Demo Guide](./demo-guide.md) — recording tips and operator checklist
- [Project Overview](./project-overview.md) — product vision
- [Test Coverage](./test-coverage.md) — 220 tests mapped to criteria
- [API Reference](./api-reference.md) — cron, unlock, and decrypt routes
