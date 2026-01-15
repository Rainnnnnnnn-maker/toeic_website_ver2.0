import { ImageResponse } from "next/og";
import { getWordBySlug } from "@/data/words";
import { getWordDetail } from "@/lib/actions";
import { loadGoogleFont } from "@/lib/og-utils";

export const alt = "TOEIC重要単語";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";


export default async function Image({ params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const wordEntry = await getWordBySlug(word);
  
  // If word doesn't exist, return default image (or handle error)
  if (!wordEntry) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            fontSize: 48,
          }}
        >
          Not Found
        </div>
      ),
      { ...size }
    );
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

  // Load fonts
  // We need to load characters for the word and translation
  const textToLoad = word + translation + "TOEIC重要単語" + " ";
  const fontData = await loadGoogleFont("Noto+Sans+JP", textToLoad);

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
