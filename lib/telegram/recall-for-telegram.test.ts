import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMemoryExcerpt,
  formatReceiptFooter,
} from "@/lib/telegram/recall-for-telegram";
import { splitTelegramMessage } from "@/lib/telegram/telegram-message-limit";

describe("formatMemoryExcerpt", () => {
  it("returns full cleaned text when no max is provided", () => {
    const text =
      "[prediction] Norway vs Senegal (Group I · Group Stage): picked NOR 2-0 at 65% confidence. Feeling: hyped. Reasoning: Norway's press will overwhelm them in the second half.";
    const excerpt = formatMemoryExcerpt(text);
    assert.ok(!excerpt.endsWith("…"));
    assert.ok(excerpt.includes("Reasoning:"));
  });
});

describe("formatReceiptFooter", () => {
  it("includes full receipt text when within Telegram limit", () => {
    const longReceipt =
      "France vs Iraq (Group I · Group Stage): picked FRA 3-0 at 90% confidence. Feeling: hyped. Reasoning: France's attack is unstoppable when Mbappé runs the channel.";
    const footer = formatReceiptFooter(
      [{ text: longReceipt }],
      { mainMessage: "Great pick!" },
    );

    assert.ok(footer.includes("Reasoning:"));
    assert.ok(!footer.includes("Rea…"));
  });
});

describe("splitTelegramMessage", () => {
  it("splits main message and receipt footer into separate parts when needed", () => {
    const main = "A".repeat(3000);
    const receipt = `\n\nWalrus receipt\n• ${"B".repeat(1200)}`;
    const parts = splitTelegramMessage(`${main}${receipt}`);

    assert.equal(parts.length, 2);
    assert.equal(parts[0], main);
    assert.ok(parts[1]?.startsWith("Walrus receipt"));
  });
});
