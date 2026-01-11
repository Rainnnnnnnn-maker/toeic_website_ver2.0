import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-utils";

export const runtime = "edge";

export const alt = "TOEIC重要単語";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";


export default async function Image() {
  const title = "TOEIC 重要単語集";
  const subtitle = "2026年版";
  const tagline = "LEVEL UP YOUR SCORE";
  const domain = "www.toeic-words.com";
  
  // Only load characters that are actually used
  const textToLoad = title + subtitle + tagline + domain + " ";

  const fontData = await loadGoogleFont(
    "Noto+Sans+JP",
    textToLoad
  );

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
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.2em",
              color: "#6b7280",
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            {tagline}
          </div>
          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
               style={{
                fontSize: 32,
                color: "#4f46e5",
                fontWeight: 700,
                background: "#eef2ff",
                padding: "4px 20px",
                borderRadius: 999,
              }}
            >
              {subtitle}
            </div>
            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 20,
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            {domain}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
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
