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

| Resource | URL |
|----------|-----|
| **Demo profile** | `/u/hoolclone-demo` — 15 real Mainnet memories with Walrus receipts |
| **Judge evolution page** | `/u/hoolclone-demo/evolution` — same-question before/after, correction override proof, Clone Clash CTA |
| **Clone Clash** | `/u/hoolclone-demo/clash?opponent=hoolclone-rival` — two Walrus namespaces debate |
| **Telegram history** | `/telegram-history` — screenshot-ready roast/congrats cards with cited memories |
| **MemWal health** | `GET /api/admin/memwal-health` |
| **Mainnet verify** | `npm run verify:mainnet` (see output below) |

On the demo profile, expand any memory card to see **Verified on Walrus Mainnet** with a truncated blob ID and full proof on hover. The top bar shows **Walrus: Verified** when Mainnet recall is healthy.

---

## How this satisfies the judging criteria

### Memory Depth & Authenticity

| Proof | Where to see it |
|-------|-----------------|
| Same question, two answers (Day 1 vs Day 4+) with cited Walrus memory | [`/u/hoolclone-demo/evolution`](http://localhost:3000/u/hoolclone-demo/evolution) — **Same Question — Two Answers** panel |
| Memory citations on predict with source/date provenance | [`/predict/[matchId]`](http://localhost:3000/predict) — receipt cards show `Your correction · N days ago` and Walrus recall badges |
| Correction visibly overriding a stale take | Evolution page — **Correction Override Proof** panel (stale take → correction → updated pick) |
| Live Walrus receipts | `/memory`, public profile, Telegram history |

### Creativity & Flair

| Proof | Where to see it |
|-------|-----------------|
| Memory-only cross-user feature | **Clone Clash** — `/u/hoolclone-demo/clash?opponent=hoolclone-rival` (separate Walrus namespaces) |
| Human vs clone accuracy leaderboard | Dashboard + evolution page |
| Screenshot-ready roast/congrats | `/telegram-history` — share cards with cited memory + Walrus verified badge |
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
npm run verify:mainnet
```

Expected passing checks:

- `MEMORY_BACKEND=walrus`
- `MemWal configured` (account ID + delegate key)
- `Walrus relayer health` reachable
- Demo user has **0 placeholder** blob IDs and **15+ real** Mainnet blobs

Paste your latest run output here before submitting:

```
HoolClone Mainnet readiness

PASS MEMORY_BACKEND=walrus
PASS MemWal configured
PASS Walrus relayer health — Relayer reachable (mainnet)
FAIL Demo memories use real blob IDs — run npm run db:seed-demo-walrus if placeholders remain
FAIL Demo has Walrus-stored memories — 0 real blobs until seed-demo-walrus completes
```

After `npm run db:seed-demo-walrus`, all five checks should pass (15 real Mainnet blobs, 0 placeholders).

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

npm run db:seed-demo-walrus     # 15 real Mainnet writes (~10 min)
npm run verify:mainnet          # must pass before recording demo video
```

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
| `npm run verify:mainnet` | Mainnet readiness checklist |
| `npm run memwal:setup` | One-time MemWal account setup |
| `npm run cron:setup` | Create check-resolutions job on cron-job.org (needs API key + env) |

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
- [ ] Deploy to production + set `CRON_SECRET` + [cron-job.org scheduler](docs/cron-job.md)
- [ ] Set Telegram webhook
- [ ] Record demo video (≤3 min)
