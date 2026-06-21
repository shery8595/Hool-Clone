#!/usr/bin/env node
/**
 * Register the Telegram bot webhook for production.
 *
 * Required env:
 *   TELEGRAM_BOT_TOKEN
 *   CRON_APP_URL or NEXT_PUBLIC_APP_URL — e.g. https://walrus-mu.vercel.app
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = (
  process.env.CRON_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  ""
).replace(/\/$/, "");

if (!token || !appUrl) {
  console.error(
    "Missing env. Set TELEGRAM_BOT_TOKEN and CRON_APP_URL (or NEXT_PUBLIC_APP_URL).",
  );
  process.exit(1);
}

const webhookUrl = `${appUrl}/api/telegram/webhook`;

const response = await fetch(
  `https://api.telegram.org/bot${token}/setWebhook`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  },
);

const body = await response.json();

if (!response.ok || !body.ok) {
  console.error("setWebhook failed:", body);
  process.exit(1);
}

console.log(`Telegram webhook set to ${webhookUrl}`);
console.log(JSON.stringify(body, null, 2));
