# Getting Started

This guide walks you from zero to a running HoolClone instance — locally for development, or on Walrus Mainnet for the hackathon demo.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Node.js 20+** | Matches Next.js 16 requirements |
| **Postgres** | Supabase or any hosted Postgres; `DATABASE_URL` required |
| **Sui wallet** | Optional locally; required for real user sessions in production |
| **Google AI Studio key** | Free tier Gemini 2.5 Flash for clone generation |
| **MemWal account** | Only for Walrus Mainnet memory writes (production demo) |

---

## 1. Clone and install

```bash
git clone https://github.com/shery8595/Hool-Clone.git
cd Hool-Clone
npm install
```

---

## 2. Environment variables

Copy the example file and fill in required values:

```bash
cp .env.example .env
```

### Minimum for local development

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Session signing (min 16 characters) |
| `GEMINI_API_KEY` | Clone predictions, debate, memory extraction |

Optional but recommended:

| Variable | Purpose |
|----------|---------|
| `MEMORY_BACKEND` | `local` (default) or `walrus` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

See [Deployment](./deployment.md) for the full production variable list.

---

## 3. Database setup

Apply the schema and seed World Cup 2026 fixtures:

```bash
npm run db:migrate
npm run db:seed-matches
```

The match seed also syncs live scores from [worldcup26.ir](https://worldcup26.ir) when the API is reachable.

---

## 4. Demo user (local)

For a judge-ready demo profile without Walrus writes:

```bash
npm run db:seed-demo
```

Open [http://localhost:3000/u/hoolclone-demo](http://localhost:3000/u/hoolclone-demo). Memories use placeholder blob IDs (`demo-blob-*`) — fine for UI development, not for Mainnet judging.

This creates **two** public demo accounts (`hoolclone-demo` and `hoolclone-rival`) with **10 memories each**. See [Judge Demo](./judge-demo.md) for full account details.

---

## 5. Start the dev server

```bash
npm run dev
```

| URL | What you'll see |
|-----|-----------------|
| [http://localhost:3000](http://localhost:3000) | Landing page |
| [http://localhost:3000/train](http://localhost:3000/train) | Onboarding interview |
| [http://localhost:3000/predict](http://localhost:3000/predict) | Match predictions |
| [http://localhost:3000/u/hoolclone-demo](http://localhost:3000/u/hoolclone-demo) | Public demo profile |

Connect a Sui wallet to create your own clone. Training writes memories through the configured memory backend.

---

## 6. Walrus Mainnet (hackathon / production)

For real Walrus Memory blobs on Mainnet:

```bash
# One-time MemWal account setup (writes credentials to .env)
npm run memwal:setup -- --write-env

# Set in .env
MEMORY_BACKEND=walrus
```

Seed demo memories to Mainnet (~6 minutes for 10 writes):

```bash
npm run db:seed-demo-walrus
npm run db:seed-demo-rival-walrus   # Clone Clash rival namespace
npm run verify:mainnet              # All checks must pass
```

If a write fails mid-seed:

```bash
npm run db:retry-failed-demo-walrus
```

---

## 7. Telegram bot (optional)

1. Create a bot via [@BotFather](https://t.me/BotFather).
2. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME` in `.env`.
3. Register the webhook:

```bash
CRON_APP_URL=https://your-app.vercel.app npm run telegram:webhook
```

4. Set `CRON_SECRET` and schedule the cron job — see [Production Cron](./cron-job.md).

Full bot documentation: [Telegram Bot](./telegram-bot.md).

---

## 8. Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply Postgres schema |
| `npm run db:seed-matches` | Seed WC2026 fixtures + sync scores |
| `npm run db:seed-demo` | Local demo user (placeholder blobs) |
| `npm run db:seed-demo-walrus` | Demo user with real Mainnet blobs |
| `npm run verify:mainnet` | Mainnet readiness checklist |
| `npm run memwal:setup` | One-time MemWal account setup |
| `npm run test` | Unit tests — see [Testing](./testing.md) |
| `npm run test:watch` | Re-run tests on file changes |
| `npm run lint` | ESLint |

---

## 9. First-time user flow

1. **Connect wallet** — Sui wallet signature challenge creates a session.
2. **Train** (`/train`) — Answer onboarding questions; each answer becomes a Walrus memory.
3. **Predict** (`/predict`) — Pick match winners; clone generates its prediction with cited receipts.
4. **Debate** (`/debate`) — Argue with your clone; corrections write high-weight memories.
5. **Public profile** — Enable at `/profile/public` for a shareable `/u/<slug>` page.

---

## Submission checklist

Before recording your demo or submitting to judges:

- [ ] `npm test` passes — see [Testing](./testing.md) and [Test Coverage](./test-coverage.md)
- [ ] `npm run verify:mainnet` passes on production (if using Walrus Mainnet)
- [ ] Demo profile loads with real Walrus blob IDs

---

## Next steps

| Topic | Document |
|-------|----------|
| Judge tour and criteria | [Judges Guide](./judges.md) |
| Runtime behavior (recall, cron, Telegram) | [How It Works](./how-it-works.md) |
| Walrus in every flow | [How Walrus Memory Is Used](./how-walrus-memory-is-used.md) |
| How memory improves the clone | [How Memory Improves the Agent](./how-memory-improves-agent.md) |
| Walrus namespaces, write/recall paths | [Walrus Memory](./walrus-memory.md) |
| Vercel + env vars + Mainnet | [Deployment](./deployment.md) |
| Recording the hackathon demo | [Demo Guide](./demo-guide.md) · [Judge Demo](./judge-demo.md) |
| All API endpoints | [API Reference](./api-reference.md) |

**Live production demo:** [https://walrus-mu.vercel.app](https://walrus-mu.vercel.app)
