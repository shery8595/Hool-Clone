# Production cron (cron-job.org)

Vercel Hobby does not support sub-daily platform crons, so production uses an external scheduler to call the app endpoint every minute.

**Endpoint:** `GET /api/cron/check-resolutions`  
**Auth:** `Authorization: Bearer <CRON_SECRET>` (required in production)

This job syncs live scores, sends Telegram goal alerts, runs post-match congrats/roasts, and writes post-match Walrus memories.

## Sleep cycle consolidation (every 6 hours)

**Endpoint:** `GET /api/cron/memory-consolidation`  
**Auth:** same `Authorization: Bearer <CRON_SECRET>` as match cron

This job merges repetitive `prediction_pattern` and `prediction_history_summary` memories into `consolidated_bias` blobs and archives superseded rows.

1. Create a **second** cron-job.org job pointing at `https://<your-app>.vercel.app/api/cron/memory-consolidation`
2. Schedule: every 6 hours (e.g. `hours: [0, 6, 12, 18]`, `minutes: [0]`)
3. Same `Authorization` header as the match cron

Manual demo:

```bash
npm run consolidate:demo
```

Expected HTTP `200` JSON: `{ usersProcessed, memoriesWritten, memoriesArchived }`.

## 1. Set Vercel env vars

In the Vercel project (Settings → Environment Variables), add:

| Variable | Example | Notes |
|----------|---------|-------|
| `CRON_SECRET` | long random string | Must match the header sent by cron-job.org |

Redeploy after adding `CRON_SECRET`.

## 2. Create the job in cron-job.org (UI)

1. Sign in at [cron-job.org](https://cron-job.org).
2. **Create cronjob** → **URL**.
3. **URL:** `https://<your-app>.vercel.app/api/cron/check-resolutions`
4. **Schedule:** every minute (`* * * * *` in the UI, or “every minute”).
5. **Request method:** `GET`
6. **Custom headers** (under Advanced):
   - Name: `Authorization`
   - Value: `Bearer <your CRON_SECRET>`
7. Enable **Save responses** (helps debug failed runs).
8. Save and run once manually; expect HTTP `200` with JSON `{ sync, live, telegram, resolution }`.

> cron-job.org ignores `User-Agent` and `Connection` headers. Use `Authorization` only.

## 3. Create the job via API (optional)

Copy `cron-job/job.example.json`, replace placeholders, then:

```bash
# cron-job.org → Settings → API key
export CRON_JOB_API_KEY="your-cron-job-api-key"
export CRON_APP_URL="https://walrus-mu.vercel.app"
export CRON_SECRET="your-cron-secret"

npm run cron:setup
```

Or with curl (payload from your filled-in JSON):

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRON_JOB_API_KEY" \
  -d @cron-job/job.local.json \
  https://api.cron-job.org/jobs
```

`cron-job/job.local.json` is gitignored — never commit secrets.

## 4. Verify

```bash
curl -sS "https://<your-app>.vercel.app/api/cron/check-resolutions" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Without the secret you should get `401 Unauthorized`.

## Schedule reference (cron-job.org API)

| Interval | `minutes` in schedule |
|----------|------------------------|
| Every minute | `[-1]` |
| Every 5 minutes | `[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]` |
| Every 15 minutes | `[0, 15, 30, 45]` |

`hours`, `mdays`, `months`, `wdays` set to `[-1]` means “every”.

## Local development

No external cron is needed locally. Match sync runs from:

- `maybeSyncMatchResultsInDev()` on API requests in development
- `POST /api/admin/sync-matches` for manual sync

## Related files

| File | Role |
|------|------|
| `app/api/cron/check-resolutions/route.ts` | Match sync + Telegram cron |
| `app/api/cron/memory-consolidation/route.ts` | Sleep-cycle memory consolidation |
| `cron-job/job.example.json` | API payload template |
| `scripts/setup-cron-job.mjs` | Creates job via cron-job.org API |
