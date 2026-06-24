# HoolClone

**Train your hooligan. Watch it roast you.**

> Not predicting football. Predicting you.

HoolClone is a World Cup 2026 dApp for the [Walrus Memory World Cup](https://deepsurge.xyz) hackathon. You train an AI clone of yourself as a football fan — it learns your loyalties, biases, contradictions, and prediction style, stores that knowledge durably on **Walrus Mainnet**, and uses it to predict matches, debate you, and call out your bad takes.

| | |
|---|---|
| **Live app** | [walrus-mu.vercel.app](https://walrus-mu.vercel.app) |
| **Docs (web)** | [walrus-mu.vercel.app/docs](https://walrus-mu.vercel.app/docs) |
| **Judges guide** | [walrus-mu.vercel.app/docs/judges](https://walrus-mu.vercel.app/docs/judges) |
| **GitHub** | [shery8595/Hool-Clone](https://github.com/shery8595/Hool-Clone) |

---

## For judges (start here)

**15-minute tour:** [docs/judges.md](docs/judges.md) · [live evolution page](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution)

| Proof | URL |
|-------|-----|
| Demo profile (10 Mainnet memories) | [/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo) |
| Evolution & judge panels + live sandbox | [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) |
| Clone Clash (two Walrus namespaces) | [/u/hoolclone-demo/clash?opponent=hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival) |
| Telegram roast cards (public demo) | [/u/hoolclone-demo/telegram-history](https://walrus-mu.vercel.app/u/hoolclone-demo/telegram-history) |

**CLI checks** (optional): `npm run verify:mainnet` · `npm test` (215 unit tests, offline)

Full criteria mapping, real-vs-curated notes, and video script: [Judges Guide](docs/judges.md) · [Demo Guide](docs/demo-guide.md)

---

## What this does

Most football apps predict *matches*. HoolClone predicts *you*.

You teach your clone who you support, how you think, and when you contradict yourself. Every take, correction, debate, and prediction becomes a **memory receipt** on Walrus. Over time the clone matures from "barely knows you" to a full hooligan that argues like you — and roasts you when you're wrong.

### Core flows

| Flow | What happens |
|------|----------------|
| **Train** | Onboarding captures fan identity; each answer → Walrus memory |
| **Predict** | Clone recalls memories and predicts *your* pick with cited receipts |
| **Debate** | Clone argues from stored memories; corrections override stale takes |
| **Evolution** | Public profile shows maturity, contradictions, and judge-proof panels |
| **Telegram** | Post-match congrats/roasts write memories that shape the next recall |

### Why Walrus Memory

- **Durable** — fan takes survive across sessions, not just the chat window
- **Verifiable** — each receipt shows a real `walrusBlobId` on Mainnet
- **Behavioral** — clone `recall()` runs before every prediction, debate, and roast
- **Evolving** — corrections and post-match summaries append new blobs
- **Closed loop** — Telegram DMs → Walrus write → next predict weights them heavily

Namespaces: `hoolclone:user:<id>` per user; demo at `hoolclone:demo:hoolclone-demo`.

**Learn more:** [How Walrus Memory Is Used](docs/how-walrus-memory-is-used.md) · [How Memory Improves the Agent](docs/how-memory-improves-agent.md)

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

Open [http://localhost:3000](http://localhost:3000) — demo at [/u/hoolclone-demo](http://localhost:3000/u/hoolclone-demo).

### Walrus Mainnet (hackathon demo)

```bash
npm run memwal:setup -- --write-env
# Set MEMORY_BACKEND=walrus in .env

npm run db:seed-demo-walrus        # 10 real Mainnet writes (~5–6 min)
npm run db:top-up-walrus           # only missing demo/rival writes (safe to re-run)
npm run db:seed-demo-rival-walrus  # 10 rival writes for Clone Clash (~7 min)
npm run verify:mainnet             # must pass before recording demo video
```

Full setup: [Getting Started](docs/getting-started.md) · [Deployment](docs/deployment.md)

---

## Mainnet verification

```bash
npm run verify:mainnet
```

Expected: `MEMORY_BACKEND=walrus`, MemWal configured, relayer healthy, **0** placeholder blobs, **10+** demo blobs, **10+** rival blobs. See [Judges Guide](docs/judges.md) for sample output.

If a write fails during seeding: `npm run db:retry-failed-demo-walrus`

---

## Telegram bot

Connect from the dashboard → **Connect Telegram** → open deep link → `/start` in bot.

| Command | Action |
|---------|--------|
| `/roast` | Memory-backed roast |
| `/predict m071` | Your pick + clone pick with receipts |
| `/notifications on\|off` | Match alerts |

Post-match cron (`/api/cron/check-resolutions`, every 1 min via [cron-job.org](docs/cron-job.md)) sends congrats/roasts and writes `telegram_post_match` memories.

Full reference: [Telegram Bot](docs/telegram-bot.md)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, Tailwind |
| Memory | Walrus via `@mysten-incubation/memwal` |
| LLM | Gemini 2.5 Flash |
| Auth | Sui wallet signature challenge |
| Database | Postgres |
| Bot | grammy + Telegram webhook |
| Deploy | Vercel |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | 220 unit tests (offline) |
| `npm run db:migrate` | Apply Postgres schema |
| `npm run db:seed-matches` | Seed WC2026-style fixtures |
| `npm run db:seed-demo` | Demo user (local placeholders) |
| `npm run db:seed-demo-walrus` | Demo user with real Mainnet blobs |
| `npm run db:seed-demo-rival-walrus` | Rival user for Clone Clash |
| `npm run verify:mainnet` | Mainnet readiness checklist |
| `npm run memwal:setup` | One-time MemWal account setup |
| `npm run cron:setup` | Match resolution cron (every 1 min) |
| `npm run cron:setup-consolidation` | Memory consolidation cron (every 6 h) |
| `npm run telegram:webhook` | Register Telegram webhook |

---

## Documentation

| Resource | Link |
|----------|------|
| **Web docs** | [/docs](https://walrus-mu.vercel.app/docs) |
| **Judges guide** | [docs/judges.md](docs/judges.md) |
| **How Walrus is used** | [docs/how-walrus-memory-is-used.md](docs/how-walrus-memory-is-used.md) |
| **How memory improves agent** | [docs/how-memory-improves-agent.md](docs/how-memory-improves-agent.md) |
| **Getting started** | [docs/getting-started.md](docs/getting-started.md) |
| **Walrus Memory** | [docs/walrus-memory.md](docs/walrus-memory.md) |
| **Architecture** | [docs/hoolclone-architecture.md](docs/hoolclone-architecture.md) |
| **API reference** | [docs/api-reference.md](docs/api-reference.md) |
| **Testing** | [docs/testing.md](docs/testing.md) |
| **Full index** | [docs/README.md](docs/README.md) |

---

## Submission checklist

- [x] Public GitHub repo with README
- [x] Walrus Mainnet memory writes (not placeholder blob IDs)
- [x] Public profile with verifiable memory receipts
- [x] Clone behavior driven by `recall()` from Walrus namespaces
- [x] Telegram bot with post-match loop + Walrus memories
- [x] Deploy to production ([walrus-mu.vercel.app](https://walrus-mu.vercel.app))
- [x] 215 unit tests (`npm test`)
- [x] Dedicated judge + memory docs
- [ ] Set `CRON_SECRET` on Vercel + both [cron-job.org](docs/cron-job.md) jobs (`npm run cron:setup` + `npm run cron:setup-consolidation`)
- [ ] Run `CRON_APP_URL=https://walrus-mu.vercel.app npm run telegram:webhook` against production
- [ ] Reseed demo after narrative fix: `npm run db:seed-demo-walrus` + `npm run db:seed-demo-rival-walrus`
- [ ] Record demo video (≤3 min) — script in [Demo Guide](docs/demo-guide.md)
