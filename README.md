# HoolClone

**Train your hooligan. Watch it roast you.**

HoolClone is a World Cup 2026 dApp where you train an AI clone of yourself as a football fan. The clone stores durable memory on **Walrus Mainnet** and uses those memories to predict matches, debate you, expose contradictions, and roast your takes — including via Telegram when your team loses.

> Not predicting football. Predicting you.

- **Live demo profile:** `/u/hoolclone-demo`
- **GitHub:** [shery8595/Hool-Clone](https://github.com/shery8595/Hool-Clone)
- **Stack:** Next.js 16, Walrus Memory (`@mysten-incubation/memwal`), Gemini 2.5 Flash, Postgres, Sui wallet

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and AUTH_SECRET at minimum

npm run db:migrate
npm run db:seed-matches
npm run db:seed-demo          # local demo data (placeholder blob IDs)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Walrus Mainnet setup

```bash
npm run memwal:setup -- --write-env
# Set MEMORY_BACKEND=walrus in .env

npm run db:seed-demo-walrus     # writes real Mainnet blobs for demo user (~10 min)
```

Verify health: `GET /api/admin/memwal-health` (set `x-admin-secret` in production).

## Telegram bot

1. Create a bot via [@BotFather](https://t.me/BotFather) and set `TELEGRAM_BOT_TOKEN`.
2. Deploy the app and set webhook:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook"
   ```

3. Link your wallet in Telegram:

   - `/link <your-sui-wallet-address>` — bot sends a message to sign
   - Sign with your Sui wallet, then `/verify <signature>`
   - `/notifications on` — opt in to post-loss roasts

Commands: `/start`, `/roast`, `/predict m071`, `/notifications on|off`, `/unlink`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply Postgres schema |
| `npm run db:seed-matches` | Seed WC2026-style fixtures |
| `npm run db:seed-demo` | Demo user (local memory metadata) |
| `npm run db:seed-demo-walrus` | Demo user with real Walrus blobs |
| `npm run memwal:setup` | Configure MemWal account |

## Docs

See [`docs/`](docs/README.md) for architecture, product design, and implementation notes.

## Hackathon

Built for the [Walrus Memory World Cup](https://deepsurge.xyz) challenge. Agent memory is stored on Walrus Mainnet; memory receipts are visible on clone predictions and public profiles.
