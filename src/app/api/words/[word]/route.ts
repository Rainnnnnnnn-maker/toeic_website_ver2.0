import "server-only";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWordBySlug } from "@/data/words";
import { getWordDetails, setWordDetails } from "@/lib/wordCache";

type RawWordPayload = {
  word: string;
  pronunciation: string;
  meanings: Array<{
    partOfSpeech: string;
    meaning: string;
    detailedMeanings: Array<{
      number: number;
      definition: string;
      example: string;
      exampleJapanese: string;
      context: string;
      frequency: string;
      synonyms: string[];
      grammarPattern?: string;
    }>;
  }>;
  wordForms: Array<{ form: string; type: string }>;
  synonyms: string[];
  nuance: string;
  toeicExamples: Array<{ english: string; japanese: string }>;
  englishDefinition: string;
  japaneseTranslation: string;
  etymology?: string;
  usageNotes?: {
    commonCollocations?: string[];
    register?: string;
    regionalVariations?: string;
  };
};

export type WordDetails = {
  word: string;
  pronunciation: string;
  meanings: Array<{
    partOfSpeech: string;
    meaning: string;
    detailedMeanings: Array<{
      number: number;
      definition: string;
      example: string;
      exampleJapanese: string;
      context: string;
      frequency: string;
      synonyms: string[];
      grammarPattern?: string;
    }>;
  }>;
  wordForms: Array<{ form: string; type: string }>;
  synonyms: string[];
  nuance: string;
  toeicExamples: Array<{ english: string; japanese: string }>;
  englishDefinition: string;
  japaneseTranslation: string;
  etymology?: string;
  usageNotes?: {
    commonCollocations?: string[];
    register?: string;
    regionalVariations?: string;
  };
};

const systemPrompt = `
Return ONLY a JSON object for "\${word}" with the following fields:
{
  "word": "\${word}",
  "pronunciation": "IPA",
  "meanings": [
    {
      "partOfSpeech": "品詞",
      "meaning": "日本語の要約（1〜3文、頻度順）",
      "detailedMeanings": [
        {
          "number": 1,
          "definition": "短い日本語定義",
          "example": "英語例文",
          "exampleJapanese": "日本語訳",
          "context": "使用場面",
          "frequency": "高/中/低",
          "synonyms": ["..."],
          "grammarPattern": "代表的な文型"
        }
      ]
    }
  ],
  "wordForms": [{ "form": "xxxx", "type": "語形" }],
  "synonyms": ["..."],
  "nuance": "1〜2文で簡潔に",
  "toeicExamples": [
    { "english": "English sentence", "japanese": "日本語訳" }
  ],
  "englishDefinition": "短い英語定義",
  "japaneseTranslation": "日本語訳"
}

Constraints:
- meanings は品詞ごとに1〜2文で簡潔に
- 語形変化は最大5件、類義語は最大5件、toeicExamples は3〜5件
- 語源・使用注意・地域差などの付加情報は含めない
- JSON以外のテキストは出力しない
`;

function parseJsonFromText(text: string): RawWordPayload {
  const trimmed = text.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (!withoutFences.includes("{")) {
    throw new Error("Gemini response did not include a JSON object");
  }

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  const jsonSlice = start !== -1 && end !== -1 ? withoutFences.slice(start, end + 1) : withoutFences;

  if (!jsonSlice.trim().endsWith("}")) {
    throw new Error("Gemini JSON output appears truncated (missing closing brace)");
  }

  try {
    return JSON.parse(jsonSlice) as RawWordPayload;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    throw new Error(msg ? `Invalid JSON from Gemini: ${msg}` : "Invalid JSON from Gemini");
  }
}

function buildModel(client: GoogleGenerativeAI, maxOutputTokens: number) {
  return client.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens,
      responseMimeType: "application/json",
    },
  });
}

function normalizePayload(word: string, payload: RawWordPayload): WordDetails {
  const meanings = Array.isArray(payload.meanings) ? payload.meanings : [];
  const normalizedMeanings = meanings.map((m) => ({
    partOfSpeech: m.partOfSpeech ?? "",
    meaning: m.meaning ?? "",
    detailedMeanings: Array.isArray(m.detailedMeanings)
      ? m.detailedMeanings.map((d) => ({
          number: typeof d.number === "number" ? d.number : 0,
          definition: d.definition ?? "",
          example: d.example ?? "",
          exampleJapanese: d.exampleJapanese ?? "",
          context: d.context ?? "",
          frequency: d.frequency ?? "",
          synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
          grammarPattern: d.grammarPattern,
        }))
      : [],
  }));

  const wordForms = Array.isArray(payload.wordForms)
    ? payload.wordForms.slice(0, 5).map((wf) => ({
        form: wf.form ?? "",
        type: wf.type ?? "",
      }))
    : [];

  const synonyms = Array.isArray(payload.synonyms) ? payload.synonyms.slice(0, 5) : [];

  const toeicExamplesRaw = Array.isArray(payload.toeicExamples) ? payload.toeicExamples : [];
  const toeicExamples = toeicExamplesRaw.slice(0, 5).map((ex) => ({
    english: ex.english ?? "",
    japanese: ex.japanese ?? "",
  }));

  return {
    word,
    pronunciation: payload.pronunciation ?? "",
    meanings: normalizedMeanings,
    wordForms,
    synonyms,
    nuance: payload.nuance ?? "",
    toeicExamples,
    englishDefinition: payload.englishDefinition ?? "",
    japaneseTranslation: payload.japaneseTranslation ?? "",
    etymology: payload.etymology,
    usageNotes: payload.usageNotes,
  };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ word: string }> }
) {
  const { word } = await context.params;
  const entry = getWordBySlug(word);

  if (!entry) {
    return Response.json({ error: "Word not found" }, { status: 404 });
  }

  let cacheBypass = false;
  try {
    const cached = await getWordDetails(entry.term);
    if (cached) {
      return Response.json(cached, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          "X-Cache": "HIT",
        },
      });
    }
  } catch {
    cacheBypass = true;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const startedAt = Date.now();
    const client = new GoogleGenerativeAI(apiKey);
    const promptBase = systemPrompt.replaceAll("${word}", entry.term);
    const prompts = [
      {
        maxOutputTokens: 1024,
        prompt: promptBase,
      },
      {
        maxOutputTokens: 2048,
        prompt:
          promptBase +
          "\n\nIMPORTANT:\n- Output MUST be a single complete JSON object.\n- If output would be long, reduce toeicExamples to 3 and synonyms to 3.\n- Keep JSON valid and complete (no truncation).\n",
      },
    ];

    let data: WordDetails | null = null;
    let lastError: unknown;

    for (const attempt of prompts) {
      try {
        const model = buildModel(client, attempt.maxOutputTokens);
        const result = await model.generateContent(attempt.prompt);
        const text = result.response.text();
        const raw = parseJsonFromText(text);
        data = normalizePayload(entry.term, raw);
        break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!data) {
      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to generate a valid JSON response from Gemini");
    }

    try {
      await setWordDetails(entry.term, data);
    } catch {
    }

    return Response.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        "X-Generation-Time": String(Date.now() - startedAt),
        "X-Cache": cacheBypass ? "BYPASS" : "MISS",
      },
    });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message ?? "")
          : "";
    return Response.json(
      { error: message || "Failed to fetch word details from Gemini" },
      { status: 500 }
    );
  }
}
