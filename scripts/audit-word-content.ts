/** Read-only audit: Blob corpus + Redis GET only. No generation, writes or pruning. */
import { mkdir, writeFile } from "node:fs/promises";
import { Redis } from "@upstash/redis";
import { loadWordData } from "../src/lib/word-source";
import { parseStoredWordDetails } from "../src/lib/word-detail-parse";
import { HTTP_TIMEOUT_MS } from "../src/lib/http-retry";
import { getPublishedGuideArticles } from "../src/data/guide-articles";
import { contentFingerprint } from "../src/lib/content-review";

async function main() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis configuration is missing");
  const corpus = await loadWordData("blob");
  const guideWords = new Set(getPublishedGuideArticles().flatMap(a => a.blocks.flatMap(b => b.type === "wordLinks" ? b.words : [])));
  const preferred = new Set(["confirm", "submit", "approve", "adapt", "adopt", "assure", "ensure", "refund", "reimburse", "exceed", "subsequent", "preliminary", "facilitate", "considerable", "economic", "efficient", "proficient", "intensive", "thorough", "itinerary", "principal", "complement", "compliment", "proceed", "improve", "enhance", "replace", "substitute", "maintain", "preserve"]);
  const sample = (["important", "medium", "high"] as const).flatMap(level =>
    corpus.allWords.filter(w => w.level === level).sort((a, b) =>
      Number(preferred.has(b.slug)) - Number(preferred.has(a.slug)) ||
      Number(guideWords.has(b.slug)) - Number(guideWords.has(a.slug)) || a.slug.localeCompare(b.slug)
    ).slice(0, 10)
  );
  const redis = new Redis({url, token, retry: {retries: 1, backoff: () => 200}, signal: () => AbortSignal.timeout(HTTP_TIMEOUT_MS.redis)});
  const values = await redis.mget(...sample.map(w => `word:${w.slug}`));
  const records = sample.map((word, i) => {
    const detail = parseStoredWordDetails(values[i]);
    return {...word, status: detail ? "cached" : "missing", fingerprint: detail ? contentFingerprint(detail) : null, detail};
  });
  await mkdir(".artifacts/adsense", {recursive: true});
  await writeFile(".artifacts/adsense/word-sample.json", JSON.stringify({capturedAt: new Date().toISOString(), source: "blob", corpusCount: corpus.allWords.length, records}, null, 2));
  const missingLinks = [...guideWords].filter(slug => !corpus.allWords.some(w => w.slug === slug));
  console.log(JSON.stringify({sample: records.map(({slug,level,status}) => ({slug,level,status})), missingGuideLinks: missingLinks}));
}
main().catch(() => {console.error("Read-only audit failed; check network and required configuration. No upstream writes were performed."); process.exitCode = 1;});
