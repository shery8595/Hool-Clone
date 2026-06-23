import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildShareOnXIntentUrl } from "@/lib/profile/open-share-on-x";

describe("buildShareOnXIntentUrl", () => {
  it("uses x.com with a single text param including the profile URL", () => {
    const url = buildShareOnXIntentUrl(
      "My HoolClone is live — 76% clone match.",
      "https://walrus-mu.vercel.app/u/hoolclone-demo",
    );

    assert.ok(url.startsWith("https://x.com/intent/tweet?"));
    assert.ok(!url.includes("url="));
    const parsed = new URL(url);
    const text = parsed.searchParams.get("text");
    assert.ok(text?.includes("My HoolClone is live"));
    assert.ok(text?.includes("https://walrus-mu.vercel.app/u/hoolclone-demo"));
  });
});
