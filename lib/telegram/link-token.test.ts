import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TELEGRAM_START_PARAM_MAX,
  buildTelegramDeepLink,
} from "@/lib/telegram/link-token";

test("telegram deep link start param fits Telegram 64-char limit", () => {
  const token = "a".repeat(22);
  const url = buildTelegramDeepLink("HoolClone_bot", token);
  const startParam = new URL(url).searchParams.get("start");
  assert.ok(startParam);
  assert.ok(
    startParam.length <= TELEGRAM_START_PARAM_MAX,
    `start param length ${startParam.length} exceeds ${TELEGRAM_START_PARAM_MAX}`,
  );
});
