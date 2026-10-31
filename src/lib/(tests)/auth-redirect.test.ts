import { describe, expect, it } from "vitest";
import { sanitizeNextPath } from "@/lib/auth-redirect";

describe("sanitizeNextPath", () => {
  it("サイト内パスはそのまま返す", () => {
    expect(sanitizeNextPath("/mypage")).toBe("/mypage");
    expect(sanitizeNextPath("/words/apple?from=mypage")).toBe(
      "/words/apple?from=mypage"
    );
  });

  it("未指定・空文字はフォールバックする", () => {
    expect(sanitizeNextPath(null)).toBe("/");
    expect(sanitizeNextPath(undefined)).toBe("/");
    expect(sanitizeNextPath("")).toBe("/");
  });

  it("外部 URL を弾く", () => {
    expect(sanitizeNextPath("https://evil.example")).toBe("/");
    expect(sanitizeNextPath("//evil.example")).toBe("/");
    expect(sanitizeNextPath("/\\evil.example")).toBe("/");
    expect(sanitizeNextPath("mypage")).toBe("/");
  });

  it("フォールバック先を指定できる", () => {
    expect(sanitizeNextPath("//evil.example", "/mypage")).toBe("/mypage");
  });

  // ブラウザは URL 中のタブ・改行を取り除くため、そのまま返すと "//evil.example" になる
  it.each([
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "/\r\n/evil.example",
  ])("タブ・改行・CR を挟んで「//」になる %j を弾く", (raw) => {
    expect(sanitizeNextPath(raw)).toBe("/");
  });

  it.each([
    ["タブ", "/mypage\t"],
    ["NUL", "/mypage\u0000"],
    ["DEL", "/mypage\u007f"],
    ["バックスラッシュ", "/words/a\\b"],
  ])("%s をパスの途中に含む値も弾く", (_label, raw) => {
    expect(sanitizeNextPath(raw)).toBe("/");
  });

  it("スラッシュが3つ以上の値や、ホスト名が localhost の値も弾く", () => {
    expect(sanitizeNextPath("///evil.example")).toBe("/");
    // 解決後のオリジン比較だけで判定すると、基準 URL と同じホスト名の値がすり抜ける
    expect(sanitizeNextPath("//localhost/mypage")).toBe("/");
  });

  it("クエリやフラグメント付きのサイト内パスはそのまま返す", () => {
    expect(sanitizeNextPath("/mypage?x=1")).toBe("/mypage?x=1");
    expect(sanitizeNextPath("/review?queue=due#top")).toBe(
      "/review?queue=due#top"
    );
  });

  it.each([
    "/mypage",
    "/%09/evil.example",
    "/@evil.example",
    "/\t/evil.example",
    "/\\evil.example",
    "//evil.example",
    "///evil.example",
    "//localhost",
    "https://evil.example",
  ])("%j の返り値はログイン画面から解決してもサイト内に留まる", (raw) => {
    const resolved = new URL(
      sanitizeNextPath(raw),
      "https://www.toeic-words.com/login"
    );
    expect(resolved.origin).toBe("https://www.toeic-words.com");
  });
});
