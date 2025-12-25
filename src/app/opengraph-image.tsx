import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "TOEIC重要単語";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const res = await fetch(resource[1]);
    return res.arrayBuffer();
  }

  throw new Error("failed to load font");
}

export default async function Image() {
  const title = "TOEIC 重要単語集";
  const subtitle = "2026年版";
  const tagline = "LEVEL UP YOUR SCORE";
  const domain = "toeic-words.com";
  
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
          background: "radial-gradient(circle at center, #e0f2fe 0, #f9fafb 45%, #ffffff 100%)",
          fontFamily: '"Noto Sans JP", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "60px 100px",
            borderRadius: 40,
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.2em",
              color: "#64748b",
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
                color: "#3b82f6",
                fontWeight: 700,
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
