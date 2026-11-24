import { describe, expect, it } from "vitest";
import { createPublicPageMetadata } from "@/lib/public-page-metadata";

const SITE_URL = "https://www.toeic-words.com";

describe("createPublicPageMetadata", () => {
  it.each([
    ["/", `${SITE_URL}/`],
    ["/study", `${SITE_URL}/study`],
    ["/guide/part5-frequent-words", `${SITE_URL}/guide/part5-frequent-words`],
  ])("%s の正規URLを本番ドメインの絶対URLにし、og:url にも同じ値を使う", (pathname, expected) => {
    const metadata = createPublicPageMetadata({ pathname, title: "タイトル", description: "説明" });

    expect(metadata.alternates.canonical).toBe(expected);
    expect(metadata.openGraph.url).toBe(expected);
  });

  it("タイトルと説明をページ・Open Graph・Twitterカードへ同じ値で渡す", () => {
    const title = "TOEIC単語の聞き流し｜日替わり6語を音声で学習";
    const description = "日替わりのTOEIC単語6語を音声で学習できる聞き流しモードです。";
    const metadata = createPublicPageMetadata({ pathname: "/today-words/listen", title, description });

    expect(metadata).toMatchObject({
      title,
      description,
      openGraph: { title, description },
      twitter: { title, description },
    });
  });

  // Next.js は子ページの openGraph / twitter で親レイアウトの値を丸ごと置き換える。
  // ページ側の値だけで、サイト名・言語・共有画像が揃っている必要がある。
  it("親レイアウトの Open Graph を置き換えても、サイト名・言語・共有画像が欠けない", () => {
    const metadata = createPublicPageMetadata({ pathname: "/words", title: "単語一覧", description: "説明" });

    expect(metadata.openGraph).toMatchObject({
      type: "website",
      siteName: "TOEIC語彙ラボ",
      locale: "ja_JP",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    });
    expect(metadata.openGraph.images[0].alt).not.toBe("");
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["/opengraph-image"],
    });
  });
});
