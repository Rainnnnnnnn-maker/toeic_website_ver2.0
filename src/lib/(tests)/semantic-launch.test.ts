import { describe, expect, it } from "vitest";
import {
  SEMANTIC_QUERY_MAX_LENGTH,
  buildSemanticSearchUrl,
  parseSemanticLaunchParams,
} from "@/lib/semantic-launch";

describe("buildSemanticSearchUrl", () => {
  it("builds an encoded /words URL targeting the meaning tab", () => {
    expect(buildSemanticSearchUrl("延期する")).toBe(
      `/words?mode=meaning&q=${encodeURIComponent("延期する")}#word-explorer`
    );
  });

  it("trims and truncates the query to the max length", () => {
    const url = buildSemanticSearchUrl(`  ${"あ".repeat(SEMANTIC_QUERY_MAX_LENGTH + 20)}  `);
    const query = decodeURIComponent(url.split("q=")[1].split("#")[0]);
    expect(query).toBe("あ".repeat(SEMANTIC_QUERY_MAX_LENGTH));
  });
});

describe("parseSemanticLaunchParams", () => {
  it("extracts meaning mode and query from a search string", () => {
    const search = `?mode=meaning&q=${encodeURIComponent("延期する")}`;
    expect(parseSemanticLaunchParams(search)).toEqual({ mode: "meaning", query: "延期する" });
  });

  it("round-trips with buildSemanticSearchUrl", () => {
    const url = buildSemanticSearchUrl("感謝を伝えるメールで使う単語");
    const search = url.slice(url.indexOf("?"), url.indexOf("#"));
    expect(parseSemanticLaunchParams(search)).toEqual({
      mode: "meaning",
      query: "感謝を伝えるメールで使う単語",
    });
  });

  it("defaults to term mode without params or with other modes", () => {
    expect(parseSemanticLaunchParams("")).toEqual({ mode: "term", query: "" });
    expect(parseSemanticLaunchParams("?mode=term&q=abc")).toEqual({ mode: "term", query: "" });
    expect(parseSemanticLaunchParams("?q=abc")).toEqual({ mode: "term", query: "" });
  });

  it("returns meaning mode with empty query when q is missing or blank", () => {
    expect(parseSemanticLaunchParams("?mode=meaning")).toEqual({ mode: "meaning", query: "" });
    expect(parseSemanticLaunchParams("?mode=meaning&q=%20%20")).toEqual({
      mode: "meaning",
      query: "",
    });
  });

  it("truncates an overly long query", () => {
    const search = `?mode=meaning&q=${"a".repeat(SEMANTIC_QUERY_MAX_LENGTH + 50)}`;
    expect(parseSemanticLaunchParams(search).query).toBe("a".repeat(SEMANTIC_QUERY_MAX_LENGTH));
  });
});
