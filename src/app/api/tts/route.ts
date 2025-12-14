export async function POST(request: Request) {
  const apiKey = process.env.TTS_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "TTS_API_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

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
          voice: {
            languageCode: "en-US",
            name: "en-US-Standard-A",
          },
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
