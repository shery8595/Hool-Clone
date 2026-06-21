import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fallbackExtraction } from "@/lib/onboarding/extract-memory";

describe("fallbackExtraction", () => {
  it("creates fan_profile fact from answer", () => {
    const result = fallbackExtraction({
      question: "Who is your favorite team?",
      answer: "Brazil — always, even when struggling",
    });
    assert.equal(result.facts[0]?.type, "fan_profile");
    assert.ok(result.facts[0]?.text.includes("Brazil"));
    assert.equal(result.profileHints.favoriteTeam, "Brazil");
  });

  it("extracts rival from never trust question", () => {
    const result = fallbackExtraction({
      question: "Which team do you never trust?",
      answer: "England — they choke",
    });
    assert.equal(result.profileHints.rivalTeam, "England");
  });

  it("adds England bias fact when answer mentions England", () => {
    const result = fallbackExtraction({
      question: "Worst heartbreak?",
      answer: "England losing on penalties again",
      driver: "loyalty",
    });
    assert.ok(result.facts.some((f) => f.type === "bias"));
    assert.ok(result.facts.some((f) => f.text.includes("England")));
  });

  it("truncates long answers in summary", () => {
    const long = "x".repeat(150);
    const result = fallbackExtraction({
      question: "Describe your style",
      answer: long,
    });
    assert.ok(result.summaryLine.endsWith("..."));
  });
});
