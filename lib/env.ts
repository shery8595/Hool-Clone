import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  SUI_NETWORK: z.enum(["mainnet", "testnet", "devnet"]).default("mainnet"),
  MEMORY_BACKEND: z.enum(["local", "walrus"]).default("local"),
  MEMWAL_ACCOUNT_ID: z.string().min(1).optional(),
  MEMWAL_DELEGATE_PRIVATE_KEY: z.string().min(1).optional(),
  MEMWAL_PRIVATE_KEY: z.string().min(1).optional(),
  MEMWAL_SERVER_URL: z.string().url().optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_BOT_USERNAME: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  WALRUS_AGGREGATOR_URL: z.string().url().optional(),
  WORLDCUP26_BASE_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

function envOrUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  return value;
}

export function getEnv(): Env {
  if (cached) return cached;
  cached = envSchema.parse({
    DATABASE_URL: envOrUndefined(process.env.DATABASE_URL),
    AUTH_SECRET: envOrUndefined(process.env.AUTH_SECRET),
    GEMINI_API_KEY: envOrUndefined(process.env.GEMINI_API_KEY),
    SUI_NETWORK: envOrUndefined(process.env.SUI_NETWORK),
    MEMORY_BACKEND: envOrUndefined(process.env.MEMORY_BACKEND),
    MEMWAL_ACCOUNT_ID: envOrUndefined(process.env.MEMWAL_ACCOUNT_ID),
    MEMWAL_DELEGATE_PRIVATE_KEY: envOrUndefined(
      process.env.MEMWAL_DELEGATE_PRIVATE_KEY,
    ),
    MEMWAL_PRIVATE_KEY: envOrUndefined(process.env.MEMWAL_PRIVATE_KEY),
    MEMWAL_SERVER_URL: envOrUndefined(process.env.MEMWAL_SERVER_URL),
    TELEGRAM_BOT_TOKEN: envOrUndefined(process.env.TELEGRAM_BOT_TOKEN),
    TELEGRAM_BOT_USERNAME: envOrUndefined(process.env.TELEGRAM_BOT_USERNAME),
    CRON_SECRET: envOrUndefined(process.env.CRON_SECRET),
    NEXT_PUBLIC_APP_URL: envOrUndefined(process.env.NEXT_PUBLIC_APP_URL),
    WALRUS_AGGREGATOR_URL: envOrUndefined(process.env.WALRUS_AGGREGATOR_URL),
    WORLDCUP26_BASE_URL: envOrUndefined(process.env.WORLDCUP26_BASE_URL),
    NODE_ENV: envOrUndefined(process.env.NODE_ENV),
  });
  return cached;
}

export function requireDatabaseUrl(): string {
  const url = getEnv().DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set it in .env or .env.local (see .env.example).",
    );
  }
  return url;
}

export function requireAuthSecret(): string {
  const secret = getEnv().AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is required (min 16 chars). Set it in .env or .env.local.",
    );
  }
  return secret;
}

const DEFAULT_MEMWAL_SERVER_URL = "https://relayer.memwal.ai";

export function getMemWalServerUrl(): string {
  return getEnv().MEMWAL_SERVER_URL ?? DEFAULT_MEMWAL_SERVER_URL;
}

export function getMemWalAccountId(): string | undefined {
  return getEnv().MEMWAL_ACCOUNT_ID;
}

export function getMemWalDelegateKey(): string | undefined {
  return getEnv().MEMWAL_DELEGATE_PRIVATE_KEY ?? getEnv().MEMWAL_PRIVATE_KEY;
}

export function isMemWalConfigured(): boolean {
  return Boolean(getMemWalAccountId() && getMemWalDelegateKey());
}

export function requireMemWalConfig(): {
  accountId: string;
  delegateKey: string;
  serverUrl: string;
} {
  const accountId = getMemWalAccountId();
  const delegateKey = getMemWalDelegateKey();
  if (!accountId || !delegateKey) {
    throw new Error(
      "Walrus Memory requires MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_PRIVATE_KEY (or MEMWAL_PRIVATE_KEY).",
    );
  }
  return {
    accountId,
    delegateKey,
    serverUrl: getMemWalServerUrl(),
  };
}

export function getTelegramBotToken(): string | undefined {
  return getEnv().TELEGRAM_BOT_TOKEN;
}

export function getTelegramBotUsername(): string | undefined {
  return getEnv().TELEGRAM_BOT_USERNAME;
}

export function getCronSecret(): string | undefined {
  return getEnv().CRON_SECRET;
}

export function getAppUrl(): string {
  return getEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

const DEFAULT_WORLDCUP26_BASE_URL = "https://worldcup26.ir";

/** Match sync uses worldcup26.ir (public API, no key required). */
export function isFootballApiConfigured(): boolean {
  return true;
}

export function getWorldCup26BaseUrl(): string {
  return getEnv().WORLDCUP26_BASE_URL ?? DEFAULT_WORLDCUP26_BASE_URL;
}
