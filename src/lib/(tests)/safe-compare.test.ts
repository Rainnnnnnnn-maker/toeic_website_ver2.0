import { describe, it, expect } from "vitest";
import { safeEqual } from "../safe-compare";

describe("safeEqual", () => {
  it("returns true for identical non-empty strings", () => {
    expect(safeEqual("super-secret-token", "super-secret-token")).toBe(true);
  });

  it("returns false for differing strings", () => {
    expect(safeEqual("super-secret-token", "wrong-token")).toBe(false);
  });

  it("returns false when lengths differ", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("returns false when either side is missing", () => {
    expect(safeEqual(null, "token")).toBe(false);
    expect(safeEqual("token", undefined)).toBe(false);
    expect(safeEqual(null, null)).toBe(false);
  });

  it("returns false for empty strings (treated as unset)", () => {
    expect(safeEqual("", "")).toBe(false);
    expect(safeEqual("", "token")).toBe(false);
  });
});
