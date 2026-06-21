import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMemorySourceLabel,
  formatProvenanceLabel,
} from "@/lib/clone/memory-provenance";

describe("formatMemorySourceLabel", () => {
  it("maps known sources", () => {
    assert.equal(formatMemorySourceLabel("clone_correction"), "Your correction");
    assert.equal(formatMemorySourceLabel("prediction_submit"), "Your prediction");
  });

  it("formats unknown sources", () => {
    assert.equal(formatMemorySourceLabel("custom_source"), "custom source");
  });
});

describe("formatProvenanceLabel", () => {
  it("combines source and relative date", () => {
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const label = formatProvenanceLabel("onboarding", recent);
    assert.ok(label?.includes("Onboarding"));
    assert.ok(label?.includes("days ago"));
  });

  it("adds same match for prediction_submit", () => {
    const label = formatProvenanceLabel(
      "prediction_submit",
      new Date().toISOString(),
      "m071",
    );
    assert.ok(label?.includes("same match"));
  });
});
