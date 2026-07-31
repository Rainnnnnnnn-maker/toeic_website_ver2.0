import { describe, expect, it } from "vitest";
import {
  buildSemanticSearchUrl,
  isValidSemanticLaunchId,
  normalizeSemanticLaunchQuery,
  parseSemanticLaunchParams,
} from "@/lib/semantic-launch";

describe("buildSemanticSearchUrl", () => {
  it("builds a /words URL with only an opaque launch id", () => {
    expect(buildSemanticSearchUrl("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "/words?mode=meaning&launch=550e8400-e29b-41d4-a716-446655440000#word-explorer"
    );
  });

  it("never places invalid or raw query text in the URL", () => {
    expect(buildSemanticSearchUrl("延期する")).toBe(
      "/words?mode=meaning#word-explorer"
    );
  });
});

describe("parseSemanticLaunchParams", () => {
  it("extracts meaning mode and a valid opaque launch id", () => {
    const search = "?mode=meaning&launch=abc_DEF-123";
    expect(parseSemanticLaunchParams(search)).toEqual({
      mode: "meaning",
      launchId: "abc_DEF-123",
    });
  });

  it("round-trips with buildSemanticSearchUrl", () => {
    const url = buildSemanticSearchUrl("550e8400-e29b-41d4-a716-446655440000");
    const search = url.slice(url.indexOf("?"), url.indexOf("#"));
    expect(parseSemanticLaunchParams(search)).toEqual({
      mode: "meaning",
      launchId: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("defaults to term mode without params or with other modes", () => {
    expect(parseSemanticLaunchParams("")).toEqual({ mode: "term", launchId: "" });
    expect(parseSemanticLaunchParams("?mode=term&launch=abc")).toEqual({
      mode: "term",
      launchId: "",
    });
    expect(parseSemanticLaunchParams("?launch=abc")).toEqual({
      mode: "term",
      launchId: "",
    });
  });

  it("ignores missing or invalid launch ids", () => {
    expect(parseSemanticLaunchParams("?mode=meaning")).toEqual({
      mode: "meaning",
      launchId: "",
    });
    expect(parseSemanticLaunchParams("?mode=meaning&launch=検索語")).toEqual({
      mode: "meaning",
      launchId: "",
    });
  });
});

describe("semantic launch validation", () => {
  it("normalizes a query without exposing it to URL helpers", () => {
    expect(normalizeSemanticLaunchQuery(`  ${"あ".repeat(120)}  `)).toBe("あ".repeat(100));
  });

  it("accepts URL-safe ids up to 64 characters", () => {
    expect(isValidSemanticLaunchId("abc_DEF-123")).toBe(true);
    expect(isValidSemanticLaunchId("a".repeat(64))).toBe(true);
    expect(isValidSemanticLaunchId("")).toBe(false);
    expect(isValidSemanticLaunchId("a".repeat(65))).toBe(false);
    expect(isValidSemanticLaunchId("検索語")).toBe(false);
  });
});
