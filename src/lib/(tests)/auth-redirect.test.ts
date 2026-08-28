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
});
