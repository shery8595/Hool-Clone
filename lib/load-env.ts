import { config } from "dotenv";
import { resolve } from "node:path";

/** Load .env then .env.local (same precedence as Next.js) for tsx/cli scripts. */
export function loadEnv(): void {
  config({ path: resolve(process.cwd(), ".env") });
  config({ path: resolve(process.cwd(), ".env.local"), override: true });
}
