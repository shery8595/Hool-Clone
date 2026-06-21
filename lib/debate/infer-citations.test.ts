import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inferCitedReceipts } from "@/lib/debate/infer-citations";
import { makeReceipt } from "@/lib/test/fixtures";

const catalog = [
  makeReceipt({ id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", number: 1, text: "A" }),
  makeReceipt({ id: "11111111-2222-4333-8444-555555555555", number: 2, text: "B" }),
  makeReceipt({ id: "99999999-8888-4777-6666-555555555555", number: 3, text: "C" }),
];

describe("inferCitedReceipts", () => {
  it("resolves UUID citations", () => {
    const cited = inferCitedReceipts(
      "See memory",
      ["aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"],
      catalog,
    );
    assert.equal(cited.length, 1);
    assert.equal(cited[0]?.id, "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
  });

  it("resolves #number citations from reply text", () => {
    const cited = inferCitedReceipts("Receipt #2 says it all", undefined, catalog);
    assert.equal(cited[0]?.number, 2);
  });

  it("ignores invalid UUIDs", () => {
    const cited = inferCitedReceipts("Nope", ["not-a-uuid"], catalog);
    assert.equal(cited.length, 0);
  });

  it("caps at three citations", () => {
    const cited = inferCitedReceipts(
      "#1 #2 #3 #4",
      [
        "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        "11111111-2222-4333-8444-555555555555",
        "99999999-8888-4777-6666-555555555555",
      ],
      catalog,
    );
    assert.ok(cited.length <= 3);
  });
});
