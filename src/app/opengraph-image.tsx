import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_IMAGE_CACHE_CONTROL } from "@/lib/og-utils";

// `cacheComponents` 環境では `export const revalidate` が無効化されるため指定しない。
// Active CPU の抑制は OG_IMAGE_CACHE_CONTROL による CDN キャッシュで行う（og-utils.ts 参照）。
export const alt = "TOEIC重要単語";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const fontData = await loadGoogleFont("Noto+Sans+JP");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f6e 55%, #1e3a8a 100%)",
          fontFamily: '"Noto Sans JP", sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 装飾用サークル（右上） */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.14)",
            display: "flex",
          }}
        />
        {/* 装飾用サークル（左下） */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.12)",
            display: "flex",
          }}
        />
        {/* 装飾用サークル（右中） */}
        <div
          style={{
            position: "absolute",
            top: 180,
            right: 80,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(147, 197, 253, 0.06)",
            border: "1px solid rgba(147, 197, 253, 0.1)",
            display: "flex",
          }}
        />

        {/* トップバー */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: 999,
              padding: "8px 24px",
              fontSize: 18,
              color: "rgba(255, 255, 255, 0.75)",
              letterSpacing: "0.06em",
              fontWeight: 600,
              display: "flex",
            }}
          >
            AI解説付き · 完全無料
          </div>
        </div>

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* タグライン */}
          <div
            style={{
              fontSize: 19,
              letterSpacing: "0.28em",
              color: "rgba(147, 197, 253, 0.85)",
              fontWeight: 700,
              display: "flex",
            }}
          >
            LEVEL UP YOUR SCORE
          </div>

          {/* メインタイトル */}
          <div
            style={{
              fontSize: 86,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
              display: "flex",
              letterSpacing: "-0.01em",
            }}
          >
            TOEIC 重要単語集
          </div>

          {/* サブタイトル */}
          <div
            style={{
              fontSize: 26,
              color: "rgba(199, 210, 254, 0.85)",
              fontWeight: 600,
              display: "flex",
              letterSpacing: "0.04em",
            }}
          >
            2026年版 · 最新
          </div>
        </div>

        {/* ボトムバー */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* レベルバッジ */}
          <div style={{ display: "flex", gap: 14 }}>
            {/* 600点 最重要 */}
            <div
              style={{
                background: "rgba(59, 130, 246, 0.22)",
                border: "1px solid rgba(59, 130, 246, 0.5)",
                borderRadius: 14,
                padding: "12px 26px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(147, 197, 253, 0.65)",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                TOEIC 600点
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "#93c5fd",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                最重要単語
              </div>
            </div>

            {/* 730点 中級 */}
            <div
              style={{
                background: "rgba(139, 92, 246, 0.22)",
                border: "1px solid rgba(139, 92, 246, 0.5)",
                borderRadius: 14,
                padding: "12px 26px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(196, 181, 253, 0.65)",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                TOEIC 730点
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "#c4b5fd",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                中級単語
              </div>
            </div>

            {/* 800点 上級 */}
            <div
              style={{
                background: "rgba(239, 68, 68, 0.18)",
                border: "1px solid rgba(239, 68, 68, 0.44)",
                borderRadius: 14,
                padding: "12px 26px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(252, 165, 165, 0.65)",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                TOEIC 800点
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: "#fca5a5",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                上級単語
              </div>
            </div>
          </div>

          {/* ドメイン */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(148, 163, 184, 0.7)",
              fontWeight: 500,
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            www.toeic-words.com
          </div>
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
