import { describe, expect, it } from "vitest";
import type { WordDetails } from "@/types/word";
import { generateWordDetailJsonLd, serializeJsonLd } from "@/lib/json-ld";

const SCRIPT_BREAKOUT = "</script><script>alert(document.domain)</script>";

describe("serializeJsonLd", () => {
  it("</script> を含む値でも < を出力しない", () => {
    const out = serializeJsonLd({ description: SCRIPT_BREAKOUT });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("JSON.parse で元の値に戻る", () => {
    const value = {
      name: SCRIPT_BREAKOUT,
      list: ["<!--", "a & b > c", "行\u2028段落\u2029"],
      nested: { count: 3, ok: true, none: null },
    };
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });

  it("U+2028 / U+2029 をエスケープして出力する", () => {
    expect(serializeJsonLd({ text: "a\u2028b\u2029c" })).toBe(
      '{"text":"a\\u2028b\\u2029c"}'
    );
  });

  it("エスケープ対象を含まない値は JSON.stringify と同じ文字列になる", () => {
    const value = {
      "@type": "DefinedTermSet",
      name: "TOEIC重要単語",
      url: "https://www.toeic-words.com",
    };
    expect(serializeJsonLd(value)).toBe(JSON.stringify(value));
  });

  it("単語詳細の JSON-LD に混入したタグも閉じタグにならない", () => {
    const detail: WordDetails = {
      word: "submit",
      pronunciation: "",
      meanings: [],
      wordForms: [],
      synonyms: [],
      nuance: "",
      toeicExamples: [],
      englishDefinition: "",
      japaneseTranslation: SCRIPT_BREAKOUT,
    };
    const jsonLd = generateWordDetailJsonLd("submit", detail);
    const out = serializeJsonLd(jsonLd);
    expect(out).not.toContain("</script");
    expect(JSON.parse(out)).toEqual(jsonLd);
  });
});
