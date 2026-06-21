# Deployment

Guide for deploying HoolClone to Vercel with Walrus Mainnet memory, Postgres, Gemini, Telegram, and external cron scheduling.

**Production URL:** [https://walrus-mu.vercel.app](https://walrus-mu.vercel.app)

---

## Deployment checklist

- [ ] Postgres database provisioned (`DATABASE_URL`)
- [ ] Schema migrated (`npm run db:migrate`)
- [ ] Matches seeded (`npm run db:seed-matches`)
- [ ] MemWal account configured (`npm run memwal:setup`)
- [ ] `MEMORY_BACKEND=walrus` set
- [ ] Demo Walrus seeds run (`db:seed-demo-walrus`, `db:seed-demo-rival-walrus`)
- [ ] `npm run verify:mainnet` passes
- [ ] `GEMINI_API_KEY` set
- [ ] `CRON_SECRET` set + [cron-job.org](./cron-job.md) scheduled
- [ ] Telegram webhook registered (`npm run telegram:webhook`)
- [ ] `NEXT_PUBLIC_APP_URL` matches deployment domain

---

## Environment variables

### Required

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://...` | Postgres (users, memories index, matches) |
| `AUTH_SECRET` | 32+ char random string | Wallet session JWT signing |
| `NEXT_PUBLIC_APP_URL` | `https://walrus-mu.vercel.app` | Deep links, Telegram, CORS |
| `GEMINI_API_KEY` | From Google AI Studio | Clone, debate, roasts |

### Walrus Memory (Mainnet)

| Variable | Purpose |
|----------|---------|
| `MEMORY_BACKEND` | Set to `walrus` in production |
| `SUI_NETWORK` | `mainnet` |
| `MEMWAL_ACCOUNT_ID` | MemWal account from setup |
| `MEMWAL_DELEGATE_PRIVATE_KEY` | Delegate key for writes/recall |
| `MEMWAL_SERVER_URL` | `https://relayer.memwal.ai` |

One-time setup (run locally against production DB):

```bash
npm run memwal:setup -- --write-env
# Copy MEMWAL_* values to Vercel
```

### Cron and admin

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Bearer token for `/api/cron/check-resolutions` |
| `CRON_JOB_API_KEY` | cron-job.org API key (for `npm run cron:setup`) |
| `CRON_APP_URL` | Production URL for setup scripts |
| `ADMIN_SECRET` | Optional; protects `/api/admin/memwal-health` in production |

### Telegram

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_BOT_USERNAME` | Bot username (no @) |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `WORLDCUP26_BASE_URL` | `https://worldcup26.ir` | Live score API |
| `WALRUS_AGGREGATOR_URL` | Walrus mainnet aggregator | Blob explorer links |
| `GEMINI_MODEL` | `gemini-2.5-flash` | LLM model override |

Full template: `.env.example` in the repo root.

---

## Vercel deployment

### 1. Link project

```bash
npx vercel link
```

Or connect the GitHub repo in the Vercel dashboard.

### 2. Set environment variables

Vercel → Project → Settings → Environment Variables.

Add all required variables for **Production** (and Preview if needed). Redeploy after changes.

### 3. Build settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build command | `npm run build` |
| Output | Default (`.next`) |

### 4. Run migrations and seeds

Run against the **production** `DATABASE_URL` from your local machine:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate
DATABASE_URL="postgresql://..." npm run db:seed-matches
DATABASE_URL="postgresql://..." npm run db:seed-demo-walrus
DATABASE_URL="postgresql://..." npm run db:seed-demo-rival-walrus
DATABASE_URL="postgresql://..." npm run verify:mainnet
```

Walrus seeds take ~10–17 minutes total. Do not run concurrently on the same namespace.

---

## Cron scheduling

Vercel Hobby does **not** support sub-daily platform crons. Use [cron-job.org](./cron-job.md):

```bash
export CRON_JOB_API_KEY="..."
export CRON_APP_URL="https://walrus-mu.vercel.app"
export CRON_SECRET="..."

npm run cron:setup
```

Endpoint: `GET /api/cron/check-resolutions`  
Auth: `Authorization: Bearer <CRON_SECRET>`

---

## Telegram webhook

After deploying with `TELEGRAM_BOT_TOKEN` set:

```bash
CRON_APP_URL=https://walrus-mu.vercel.app npm run telegram:webhook
```

Verify the bot responds to `/start` in Telegram.

---

## Mainnet verification

Before recording a demo video:

```bash
npm run verify:mainnet
```

All checks must pass:

- `MEMORY_BACKEND=walrus`
- MemWal configured
- Walrus relayer health reachable
- Demo: 0 placeholder blobs, 15+ real blobs
- Rival: 0 placeholder blobs, 5+ real blobs

---

## Environments

| Environment | Memory backend | Database | Purpose |
|-------------|----------------|----------|---------|
| **Local** | `local` or `walrus` | Local/dev Postgres | Development |
| **Preview** | `local` recommended | Preview DB | PR previews |
| **Production** | `walrus` | Production Postgres | Hackathon demo |

---

## Health endpoints

| Endpoint | Auth | Returns |
|----------|------|---------|
| `GET /api/memories/health` | Session | User-facing Walrus status |
| `GET /api/admin/memwal-health` | `ADMIN_SECRET` | Relayer + account health |
| `GET /api/cron/check-resolutions` | `CRON_SECRET` | Sync + notification stats |

Manual score sync (admin):

```bash
curl -X POST https://walrus-mu.vercel.app/api/admin/sync-matches \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **Postgres fallback recall** badge everywhere | Check `MEMWAL_*` env vars; hit `/api/admin/memwal-health` |
| Cron returns 401 | `CRON_SECRET` mismatch between Vercel and cron-job.org |
| Telegram bot silent | Re-run `telegram:webhook`; check `TELEGRAM_BOT_TOKEN` |
| Demo shows placeholder blobs | Re-run `db:seed-demo-walrus` against production DB |
| Walrus write failed mid-seed | `npm run db:retry-failed-demo-walrus` |
| Scores not updating | Verify cron job runs every minute; check worldcup26.ir reachability |

---

## Related docs

- [Getting Started](./getting-started.md) — local setup
- [Production Cron](./cron-job.md) — cron-job.org setup
- [Walrus Memory](./walrus-memory.md) — MemWal configuration
- [Telegram Bot](./telegram-bot.md) — bot setup
