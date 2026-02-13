import "server-only";

export async function POST(request: Request) {
  // Security Check: Verify Custom Header
  const sourceHeader = request.headers.get("X-App-Source");
  if (sourceHeader !== "toeic-client") {
    return Response.json({ error: "Unauthorized source" }, { status: 403 });
  }

  // Security Check: Verify Origin/Referer
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (host) {
    const allowed = (origin && origin.includes(host)) || (referer && referer.includes(host));
    if (!allowed) {
      return Response.json({ error: "Unauthorized origin" }, { status: 403 });
    }
  }

  const apiKey = process.env.TTS_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "TTS_API_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Guard: Validate input length instead of whitelist to allow sentences
  if (body.text.length > 500) {
    return Response.json({ error: "Text too long" }, { status: 400 });
  }

  // Determine language and voice settings
  const language = body.language === "ja" ? "ja" : "en";
  const voiceConfig = language === "ja"
    ? { languageCode: "ja-JP", name: "ja-JP-Standard-A" }
    : { languageCode: "en-US", name: "en-US-Standard-A" };

  // NOTE: We removed the getWordBySlug check to allow sentence synthesis.
  // const wordEntry = getWordBySlug(body.text.toLowerCase());
  // if (!wordEntry) {
  //   return Response.json({ error: "Word not allowed" }, { status: 400 });
  // }

  try {
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text: body.text },
          voice: voiceConfig,
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.95,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      return Response.json(
        { error: "Failed to synthesize speech" },
        { status: 500 }
      );
    }

    const json = (await ttsResponse.json()) as { audioContent?: string };

    if (!json.audioContent) {
      return Response.json(
        { error: "TTS response did not include audio content" },
        { status: 500 }
      );
    }

    return Response.json(
      { audioContent: json.audioContent },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch {
    return Response.json({ error: "Unexpected error while calling TTS API" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    {
      error: "Method Not Allowed",
      message: "This endpoint requires a POST request with a JSON body containing the 'text' to synthesize.",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    }
  );
}
