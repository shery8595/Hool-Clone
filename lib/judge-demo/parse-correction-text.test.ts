import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseJudgeDemoCorrectionText } from "@/lib/judge-demo/parse-correction-text";

describe("parseJudgeDemoCorrectionText", () => {
  it("accepts trimmed text within bounds", () => {
    const result = parseJudgeDemoCorrectionText(
      "  I back Portugal when it gets nervy.  ",
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.text, "I back Portugal when it gets nervy.");
    }
  });

  it("rejects short corrections", () => {
    const result = parseJudgeDemoCorrectionText("short");
    assert.equal(result.ok, false);
  });

  it("rejects non-strings", () => {
    const result = parseJudgeDemoCorrectionText(42);
    assert.equal(result.ok, false);
  });
});
