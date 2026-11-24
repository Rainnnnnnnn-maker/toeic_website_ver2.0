import type { Metadata } from "next";

const SITE_URL = "https://www.toeic-words.com";
const SHARE_IMAGE = "/opengraph-image";

export function createPublicPageMetadata({
  pathname,
  title,
  description,
}: {
  pathname: string;
  title: string;
  description: string;
}) {
  const url = new URL(pathname, SITE_URL).href;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "TOEIC語彙ラボ",
      locale: "ja_JP",
      images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: "TOEIC語彙ラボ｜例文・音声付き無料単語帳" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE],
    },
  } satisfies Metadata;
}
