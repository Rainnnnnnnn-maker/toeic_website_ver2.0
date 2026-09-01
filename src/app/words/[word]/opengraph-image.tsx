import { ImageResponse } from "next/og";
import { getWordBySlug } from "@/data/words";
import { getWordDetail } from "@/data/word-detail";
import {
  loadGoogleFont,
  OG_IMAGE_CACHE_CONTROL,
  OG_IMAGE_NOT_FOUND_CACHE_CONTROL,
} from "@/lib/og-utils";

export const alt = "TOEIC重要単語";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// `generateStaticParams` / `dynamicParams = false` は意図的に持たない。
//
// `cacheComponents` 環境では metadata image route がプリレンダリングされず、動的（ƒ）のまま
// になる（prerender-manifest 上の OG ルートは 0 件）。それでも `generateStaticParams` を置くと
// ビルドの静的生成対象だけが単語数ぶん増え、1枚も出力されないプリレンダー試行が全単語で走る。
// 実測では静的生成対象が 1,422 → 2,798 ページに倍増し、静的生成 9.1s → 28.2s、
// ビルド全体 17s → 35s、macOS の圧縮メモリ 4.7GB → 11.4GB、swapin 1.4万 → 20万回まで悪化した。
// 各試行が Satori のレイアウト計算 + resvg のラスタライズ + フォントバッファを
// ワーカー数ぶん並列に抱えるためで、得られる成果物は無い。
//
// `dynamicParams = false` は `generateStaticParams` とセットでしか成立しないため、
// 未知スラッグの排除は下の `getWordBySlug` チェック（画像を描かず 404）で代替する。
// 実行時の Active CPU 抑制は OG_IMAGE_CACHE_CONTROL による CDN キャッシュで行う（og-utils.ts 参照）。

export default async function Image({ params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const wordEntry = await getWordBySlug(word);
  
  // 単語リストに無いスラッグはここで弾く（`dynamicParams = false` の代替ガード）。
  // 画像を生成せず 404 を返すので、Satori / resvg のコストは発生しない。
  if (!wordEntry) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": OG_IMAGE_NOT_FOUND_CACHE_CONTROL },
    });
  }

  // Try to fetch details for translation
  let translation = "";
  try {
    const detail = await getWordDetail(word);
    if (detail) {
      translation = detail.japaneseTranslation;
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback to entry term if translation not found (though detail should usually exist)
  if (!translation) {
      // Basic fallback if we can't get the detail
      translation = "TOEIC重要単語"; 
  }

  // 全 OGP で同じフルフォントのキャッシュを共有する。
  const fontData = await loadGoogleFont("Noto+Sans+JP");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at center, #ccfbf1 0, #f9fafb 45%, #ffffff 100%)",
          fontFamily: '"Noto Sans JP", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.96)",
            padding: "60px 100px",
            borderRadius: 40,
            border: "1px solid #e5e7eb",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
            width: "80%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.1em",
              color: "#6b7280",
              marginBottom: 20,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            TOEIC重要単語
          </div>
          
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.1,
              marginBottom: 20,
              wordBreak: "break-all",
            }}
          >
            {word}
          </div>

          <div
             style={{
              fontSize: 40,
              color: "#4f46e5", // Indigo 600
              fontWeight: 700,
              background: "#eef2ff", // Indigo 50
              padding: "10px 40px",
              borderRadius: 999,
              border: "1px solid #c7d2fe", // Indigo 200
            }}
          >
            {translation}
          </div>
        </div>
        
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          www.toeic-words.com
        </div>
      </div>
    ),
    {
      ...size,
      headers: { "Cache-Control": OG_IMAGE_CACHE_CONTROL },
      fonts: [
        {
          name: "Noto Sans JP",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
