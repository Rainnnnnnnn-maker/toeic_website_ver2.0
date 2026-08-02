import { describe, expect, it } from "vitest";
import {
  findStaleWordVectorIds,
  shouldPruneStaleWordVectors,
} from "@/lib/semantic-index-sync";

describe("findStaleWordVectorIds", () => {
  it("returns word vectors that are absent from the active corpus", () => {
    expect(
      findStaleWordVectorIds(
        [
          { id: "ability", metadata: { slug: "ability" } },
          { id: "removed", metadata: { slug: "removed" } },
          { id: "removed", metadata: { slug: "removed" } },
        ],
        ["ability"]
      )
    ).toEqual(["removed"]);
  });

  it("ignores non-word and mismatched inventory records", () => {
    expect(
      findStaleWordVectorIds(
        [
          { id: 123, metadata: { slug: "123" } },
          { id: "foreign" },
          { id: "foreign", metadata: { slug: "different" } },
          { id: "active", metadata: { slug: "active" } },
        ],
        ["active"]
      )
    ).toEqual([]);
  });
});

describe("shouldPruneStaleWordVectors", () => {
  const completeBlobRun = {
    source: "blob" as const,
    limit: null,
    onlyCached: false,
    corpusCount: 1376,
    targetCount: 1376,
    failureCount: 0,
  };

  it("allows pruning only after a complete Blob backfill", () => {
    expect(shouldPruneStaleWordVectors(completeBlobRun)).toBe(true);
  });

  it.each([
    { ...completeBlobRun, source: "local" as const },
    { ...completeBlobRun, limit: 20 },
    { ...completeBlobRun, onlyCached: true },
    { ...completeBlobRun, targetCount: 1375 },
    { ...completeBlobRun, failureCount: 1 },
    { ...completeBlobRun, corpusCount: 0, targetCount: 0 },
  ])("rejects a partial or unsafe run: %o", (context) => {
    expect(shouldPruneStaleWordVectors(context)).toBe(false);
  });
});
