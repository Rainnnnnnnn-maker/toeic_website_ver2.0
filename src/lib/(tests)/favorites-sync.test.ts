import { describe, expect, it } from "vitest";
import {
  buildFavoriteRows,
  mergeFavorites,
  parseStoredFavorites,
} from "@/lib/favorites-sync";

describe("parseStoredFavorites", () => {
  it("null は空配列を返す", () => {
    expect(parseStoredFavorites(null)).toEqual([]);
  });

  it("空文字は空配列を返す", () => {
    expect(parseStoredFavorites("")).toEqual([]);
  });

  it("正常な配列をパースする", () => {
    expect(parseStoredFavorites('["apple","banana"]')).toEqual([
      "apple",
      "banana",
    ]);
  });

  it("壊れた JSON は空配列を返す", () => {
    expect(parseStoredFavorites("[not json")).toEqual([]);
  });

  it("配列以外の JSON は空配列を返す", () => {
    expect(parseStoredFavorites('{"a":1}')).toEqual([]);
    expect(parseStoredFavorites('"apple"')).toEqual([]);
    expect(parseStoredFavorites("42")).toEqual([]);
  });

  it("文字列以外の要素と空文字を除外する", () => {
    expect(parseStoredFavorites('["apple",1,null,"","banana",{}]')).toEqual([
      "apple",
      "banana",
    ]);
  });

  it("重複を除去する（先勝ち）", () => {
    expect(parseStoredFavorites('["a","b","a","c","b"]')).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("mergeFavorites", () => {
  it("remote を先頭に、local のみの要素を後ろに足す", () => {
    expect(mergeFavorites(["a", "b"], ["c", "d"])).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("重複は remote 側の位置を優先する", () => {
    expect(mergeFavorites(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("両方空なら空配列", () => {
    expect(mergeFavorites([], [])).toEqual([]);
  });

  it("remote が空なら local をそのまま返す", () => {
    expect(mergeFavorites([], ["x", "y"])).toEqual(["x", "y"]);
  });

  it("local が空なら remote をそのまま返す", () => {
    expect(mergeFavorites(["x"], [])).toEqual(["x"]);
  });
});

describe("buildFavoriteRows", () => {
  it("userId 付きの行を組み立てる", () => {
    expect(buildFavoriteRows("user-1", ["apple", "banana"])).toEqual([
      { user_id: "user-1", word_slug: "apple" },
      { user_id: "user-1", word_slug: "banana" },
    ]);
  });

  it("重複と空文字を除外する", () => {
    expect(buildFavoriteRows("user-1", ["a", "", "a", "b"])).toEqual([
      { user_id: "user-1", word_slug: "a" },
      { user_id: "user-1", word_slug: "b" },
    ]);
  });

  it("空リストなら空配列", () => {
    expect(buildFavoriteRows("user-1", [])).toEqual([]);
  });
});
