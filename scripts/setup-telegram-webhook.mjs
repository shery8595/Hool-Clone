#!/usr/bin/env node
/**
 * Register the Telegram bot webhook for production.
 *
 * Required env (from .env / .env.local):
 *   TELEGRAM_BOT_TOKEN
 *   CRON_APP_URL or NEXT_PUBLIC_APP_URL — e.g. https://walrus-mu.vercel.app
 *
 * If api.telegram.org is blocked on your network, use --print-only and run
 * the printed curl/PowerShell command over VPN or from another network.
 */

import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const printOnly = process.argv.includes("--print-only");
const FETCH_TIMEOUT_MS = 30_000;

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = (
  process.env.CRON_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  ""
).replace(/\/$/, "");

const missing = [
  !token && "TELEGRAM_BOT_TOKEN",
  !appUrl && "CRON_APP_URL or NEXT_PUBLIC_APP_URL",
].filter(Boolean);

if (missing.length > 0) {
  console.error(`Missing env: ${missing.join(", ")}`);
  console.error(
    "Add them to .env (see .env.example). NEXT_PUBLIC_APP_URL=https://walrus-mu.vercel.app works for webhook setup.",
  );
  process.exit(1);
}

const webhookUrl = `${appUrl}/api/telegram/webhook`;
const apiUrl = `https://api.telegram.org/bot${token}/setWebhook`;
const bodyJson = JSON.stringify({ url: webhookUrl });

function printManualFallback() {
  console.log("\nCould not reach api.telegram.org from this machine.");
  console.log(
    "Common causes: ISP/firewall blocks Telegram, VPN needed, or IPv6 routing issues.",
  );
  console.log("\nTry one of these from a network that can reach Telegram:\n");
  console.log("curl (replace YOUR_BOT_TOKEN):");
  console.log(
    `curl -sS -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" -H "Content-Type: application/json" -d '${bodyJson}'`,
  );
  console.log("\nPowerShell (token from $env:TELEGRAM_BOT_TOKEN):");
  console.log(
    `Invoke-RestMethod -Uri "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/setWebhook" -Method Post -ContentType "application/json" -Body '${bodyJson}'`,
  );
  console.log("\nOr: VPN on → npm run telegram:webhook");
  console.log("\nVerify webhook:");
  console.log(
    `curl -sS "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/getWebhookInfo"`,
  );
}

if (printOnly) {
  console.log(`Webhook URL: ${webhookUrl}\n`);
  printManualFallback();
  process.exit(0);
}

try {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyJson,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const body = await response.json();

  if (!response.ok || !body.ok) {
    console.error("setWebhook failed:", body);
    process.exit(1);
  }

  console.log(`Telegram webhook set to ${webhookUrl}`);
  console.log(JSON.stringify(body, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Network error: ${message}`);
  printManualFallback();
  process.exit(1);
}
