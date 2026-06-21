# HoolClone

**Train your hooligan. Watch it roast you.**

> Not predicting football. Predicting you.

HoolClone is a World Cup 2026 dApp for the [Walrus Memory World Cup](https://deepsurge.xyz) hackathon. You train an AI clone of yourself as a football fan — it learns your loyalties, biases, contradictions, and prediction style, stores that knowledge durably on **Walrus Mainnet**, and uses it to predict matches, debate you, and call out your bad takes.

**GitHub:** [shery8595/Hool-Clone](https://github.com/shery8595/Hool-Clone)

---

## What this submission does

### The idea

Most football apps predict *matches*. HoolClone predicts *you*.

You teach your clone who you support, how you think, and when you contradict yourself. Every take, correction, debate, and prediction becomes a **memory receipt** written to Walrus. Over time the clone matures from "barely knows you" to a full hooligan that can argue like you — and roast you when you're wrong.

### Core flows

| Flow | What happens |
|------|----------------|
| **Train** | Onboarding interview captures your fan identity (loyalty, vibes vs stats, rival teams). Each answer is stored as a Walrus memory. |
| **Predict** | You pick match winners. Your clone recalls your memories and generates its own prediction with cited receipts — showing *why* it thinks like you. |
| **Debate** | Argue with your clone. It pulls from stored memories, cites contradictions, and updates when you correct it. |
| **Public profile** | Shareable `/u/<slug>` page with memory receipts, clone maturity, and prediction history — judges can inspect real Walrus blob IDs. |
| **Telegram bot** | One-tap web deep link connects your account and auto-enables match alerts. After each result, cron sends Walrus-backed **congrats or roasts**; outcomes write `post_match` memories that shape the next clone prediction. |

### Why Walrus Memory matters here

Memory is not a side feature — it is the product:

- **Durable:** Fan takes survive across sessions, not just the current chat window.
- **Verifiable:** Each memory receipt shows a real `walrusBlobId` on Mainnet — not fake placeholders.
- **Behavioral:** Clone predictions, debates, and roasts all `recall()` from the same namespace before generating output.
- **Evolving:** Corrections and post-match summaries append new blobs; the clone visibly changes over time.
- **Closed loop:** Telegram post-match DMs write structured `telegram_post_match` memories; the next clone `recall()` weights them so behavior shifts after wins and losses.

Namespaces follow `hoolclone:user:<id>` per user; the demo lives at `hoolclone:demo:hoolclone-demo`.

---

## Live demo

**Production:** [https://walrus-mu.vercel.app](https://walrus-mu.vercel.app)

| Resource | URL |
|----------|-----|
| **Demo profile** | [https://walrus-mu.vercel.app/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo) — 15 real Mainnet memories with Walrus receipts |
| **Judge evolution page** | [https://walrus-mu.vercel.app/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) — provenance panel, same-question proof, correction loop, roast card |
| **Clone Clash** | [https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival) — two Walrus namespaces debate |
| **Telegram history** | [https://walrus-mu.vercel.app/telegram-history](https://walrus-mu.vercel.app/telegram-history) — screenshot-ready roast/congrats cards |
| **MemWal health** | `GET https://walrus-mu.vercel.app/api/admin/memwal-health` |
| **Mainnet verify** | `npm run verify:mainnet` (see [Mainnet verification](#mainnet-verification)) |

On the demo profile, expand any memory card to see **Verified on Walrus Mainnet** with a truncated blob ID and full proof on hover. Placeholder demo seeds show **Demo placeholder — not on Mainnet** (amber). The top bar shows **Walrus: Verified** when Mainnet recall is healthy.

### What is real vs fallback

| Layer | Real on production demo | Fallback |
|-------|-------------------------|----------|
| Memory storage | `db:seed-demo-walrus` + `db:seed-demo-rival-walrus` → real Mainnet blobs | `db:seed-demo` → `demo-blob-*` / `rival-blob-*` placeholders |
| Recall | Walrus vector search (`Walrus: Verified recall` badge) | Postgres keyword search (`Postgres fallback recall` badge) |
| Evolution judge panels | Built from stored memories + time machine when seeds are live | Panels labeled **Illustrative fallback** if Walrus seed missing |
| LLM output | Gemini when `GEMINI_API_KEY` is set | Template fallbacks in Telegram when LLM unavailable |

> **Curated demo, real storage.** The `hoolclone-demo` fan narrative is seeded for judging clarity, but every memory receipt is a **real Walrus Mainnet blob** after `db:seed-demo-walrus`. Evolution snapshots are **reconstructed** from stored memories (not replayed historical LLM sessions). If Walrus recall fails, the UI shows **Postgres fallback recall** explicitly.

---

## How this satisfies the judging criteria

### Memory Depth & Authenticity

| Proof | Where to see it |
|-------|-----------------|
| Same question, two answers (Day 1 vs Day 4+) with cited Walrus memory | [Evolution page](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) — **Same Question — Two Answers** (live blob ID when seeded) |
| Memory provenance (blob IDs, dates, sources) | Evolution page — **Memory Provenance** table (last 4 days) |
| Memory citations on predict with source/date provenance | `/predict/[matchId]` — receipt cards show `Your correction · N days ago` and Walrus recall badges |
| Correction visibly overriding a stale take | Evolution — **Correction Override Proof** (live when correction memory has real blob) |
| Roast my record (web card) | Evolution — **Roast my record** section + `/telegram-history` |

### Creativity & Flair

| Proof | Where to see it |
|-------|-----------------|
| Memory-only cross-user feature | **Clone Clash** — [demo vs rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival) (separate Walrus namespaces) |
| Human vs clone accuracy leaderboard | Dashboard + evolution page (under **More analytics**) |
| Screenshot-ready roast/congrats | Evolution **Roast my record** + [telegram-history](https://walrus-mu.vercel.app/telegram-history) |
| Memory-driven clone mood | Dashboard + predict page — mood badge (`On Fire`, `Salty`, `Loyalist`, etc.) shapes LLM tone |

### Technical Execution & Completeness

| Proof | Where to see it |
|-------|-----------------|
| Walrus status in UI | Sidebar, top bar (`Walrus: Verified`), predict panel |
| Per-receipt recall source | `Walrus: Verified recall` vs `Postgres fallback recall` on receipt cards |
| Mainnet verification | `npm run verify:mainnet` — see [Mainnet verification](#mainnet-verification) |
| Closed-loop cron + Telegram | `GET /api/cron/check-resolutions` (cron-job.org, every 1 min) syncs scores, live goals, post-match memories |

---

## Mainnet verification

Run after seeding demo memories on Walrus:

```bash
npm run db:seed-demo-walrus        # 15 Mainnet writes (~10 min)
npm run db:seed-demo-rival-walrus  # 10 rival writes (~7 min)
npm run verify:mainnet
```

Expected passing checks:

- `MEMORY_BACKEND=walrus`
- `MemWal configured` (account ID + delegate key)
- `Walrus relayer health` reachable
- Demo user: **0** `demo-blob-*` placeholders and **15+** real Mainnet blobs
- Rival user: **0** `rival-blob-*` placeholders and **5+** real Mainnet blobs

After seeding, all checks should pass. Verified output (2026-06-22):

```
HoolClone Mainnet readiness

PASS MEMORY_BACKEND=walrus
  current: walrus

PASS MemWal configured
  MEMWAL_ACCOUNT_ID + delegate key set

PASS Walrus relayer health
  Relayer reachable (mainnet, package 0xcee7a6fd…)

PASS Demo memories use real blob IDs
  No demo-blob-* placeholders

PASS Demo has Walrus-stored memories
  15 real blobs on demo user (/u/hoolclone-demo)

PASS Rival memories use real blob IDs
  No rival-blob-* placeholders

PASS Rival has Walrus-stored memories
  10 real blobs on rival user (/u/hoolclone-rival)

All checks passed. Safe to record demo video.
```

If a single write fails during seeding, run `npm run db:retry-failed-demo-walrus` before re-running full seed.

---

## Telegram bot

A grammy-powered bot extends HoolClone beyond the browser.

### Web → Telegram connect (one tap)

After training (or from the dashboard once you have 3+ memories), tap **Connect Telegram**. The app issues a short-lived deep link:

```
POST /api/telegram/link-token  →  https://t.me/<bot>?start=link_<JWT>
```

Open the link in Telegram and tap **Start**. The bot links your chat, turns **notifications ON**, and confirms with your evolution page if your profile is public.

```
GET /api/telegram/status  →  { linked, notificationsEnabled }
```

### Bot commands

```
/start          — welcome; /start link_<token> completes web connect
/link <wallet>  — manual wallet binding fallback
/verify <sig>   — complete link with Sui signature
/roast          — get roasted using your stored memories
/predict m071   — see your pick + clone pick with receipts
/notifications on|off  — toggle match alerts (on by default after deep link)
/unlink         — revoke chat binding
```

### Post-match behavioral loop

[cron-job.org](https://cron-job.org) hits `GET /api/cron/check-resolutions` every minute (Vercel Hobby cannot run sub-daily platform crons). Setup: [`docs/cron-job.md`](docs/cron-job.md). The job syncs live scores, sends goal alerts, and checks recently finalized matches for subscribers with notifications enabled:

| Outcome | Telegram DM | Walrus write |
|---------|-------------|--------------|
| Correct pick or favorite won | Congrats (cites memories) | `prediction_history_summary` with `metadata.source: telegram_post_match`, `outcome: win` |
| Wrong pick or favorite lost | Roast (cites memories) | Same structure with `outcome: loss` |

The DM is ephemeral; the Walrus memory is private (`public_visible: false`). On the next web prediction, `recall()` includes post-match summaries and the clone prompt weights them heavily — visible on `/u/<slug>/evolution`.

---

## Tech stack

- **Frontend:** Next.js 16, React, Tailwind
- **Memory:** Walrus Memory via `@mysten-incubation/memwal` (relayer: `https://relayer.memwal.ai`)
- **LLM:** Gemini 2.5 Flash (clone predictions, debates, roasts)
- **Auth:** Sui wallet signature challenge
- **Database:** Postgres (users, memories metadata, predictions, telegram_chats)
- **Bot:** grammy + Telegram webhook

---

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and AUTH_SECRET at minimum

npm run db:migrate
npm run db:seed-matches
npm run db:seed-demo          # local demo (placeholder blob IDs)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — demo at [http://localhost:3000/u/hoolclone-demo](http://localhost:3000/u/hoolclone-demo).

### Walrus Mainnet (production / hackathon demo)

```bash
npm run memwal:setup -- --write-env
# Set MEMORY_BACKEND=walrus in .env

npm run db:seed-demo-walrus        # 15 real Mainnet writes (~10 min)
npm run db:seed-demo-rival-walrus  # 10 rival writes for Clone Clash (~7 min)
npm run verify:mainnet             # must pass before recording demo video
```

### Production environment

Set on Vercel (`https://walrus-mu.vercel.app`):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://walrus-mu.vercel.app` |
| `MEMORY_BACKEND` | `walrus` |
| `MEMWAL_ACCOUNT_ID` / `MEMWAL_DELEGATE_PRIVATE_KEY` | Mainnet writes + recall |
| `DATABASE_URL` | Same DB used by seed scripts |
| `GEMINI_API_KEY` | Clone, debate, roast generation |
| `CRON_SECRET` | Auth for `/api/cron/check-resolutions` |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` | Bot + web deep links |
| `AUTH_SECRET` | Wallet session signing |

**Cron:** `CRON_APP_URL=https://walrus-mu.vercel.app npm run cron:setup` — see [`docs/cron-job.md`](docs/cron-job.md).

**Telegram webhook:** `CRON_APP_URL=https://walrus-mu.vercel.app npm run telegram:webhook`

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply Postgres schema |
| `npm run db:seed-matches` | Seed WC2026-style fixtures |
| `npm run db:seed-demo` | Demo user (local metadata only) |
| `npm run db:seed-demo-walrus` | Demo user with real Walrus Mainnet blobs |
| `npm run db:seed-demo-rival-walrus` | Rival user with real Walrus Mainnet blobs (Clone Clash) |
| `npm run db:retry-failed-demo-walrus` | Retry demo memories that failed Walrus write (no full re-seed) |
| `npm run verify:mainnet` | Mainnet readiness checklist |
| `npm run memwal:setup` | One-time MemWal account setup |
| `npm run cron:setup` | Create check-resolutions job on cron-job.org (needs API key + env) |
| `npm run telegram:webhook` | Register Telegram webhook to `/api/telegram/webhook` |

---

## Architecture

See [`docs/hoolclone-architecture.md`](docs/hoolclone-architecture.md) for the full system design, memory model, Walrus integration, and deployment checklist.

---

## Submission checklist

- [x] Public GitHub repo with real README
- [x] Walrus Mainnet memory writes (not placeholder blob IDs)
- [x] Public profile with verifiable memory receipts
- [x] Clone behavior driven by `recall()` from Walrus namespaces
- [x] Telegram bot with post-match congrats/roasts + Walrus memory loop
- [x] Deploy to production ([walrus-mu.vercel.app](https://walrus-mu.vercel.app))
- [x] Production env documented in README (see `.env.example`)
- [ ] Set `CRON_SECRET` + [cron-job.org scheduler](docs/cron-job.md) on production DB
- [ ] Run `npm run telegram:webhook` against production
- [ ] Record demo video (≤3 min)
