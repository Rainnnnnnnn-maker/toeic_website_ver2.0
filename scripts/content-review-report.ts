/** Local report only. Does not grant or change editorial approval. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getPublishedGuideArticles } from "../src/data/guide-articles";
import { getEditorialWord } from "../src/data/word-editorial";
import { contentFingerprint, hasCurrentHumanReview, type ContentReview } from "../src/lib/content-review";
import type { WordDetails } from "../src/types/word";

async function main() {
  const sample = JSON.parse(await readFile(".artifacts/adsense/word-sample.json", "utf8")) as {
    capturedAt: string; records: { slug: string; level: string; detail: WordDetails | null }[];
  };
  let reviews: Record<string, ContentReview> = {};
  try { reviews = JSON.parse(await readFile("docs/reviews/content-approvals.json", "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const items = [
    ...getPublishedGuideArticles().map(article => ({key: `guide/${article.slug}`, content: article, note: "本文・例文・演習・出典の人による確認待ち"})),
    ...sample.records.map(word => ({key: `words/${word.slug}`, content: getEditorialWord(word.slug)?.detail ?? word.detail, note: getEditorialWord(word.slug)?.note ?? "標本のAI確認済み。人による内容確認待ち"})),
  ];
  const records = items.map(item => ({url: `https://www.toeic-words.com/${item.key}`, key: item.key, fingerprint: contentFingerprint(item.content), humanReviewed: item.content !== null && hasCurrentHumanReview(item.content, reviews[item.key]), note: item.note}));
  await mkdir("docs/reviews", {recursive: true});
  await writeFile("docs/reviews/adsense-content-inventory.json", JSON.stringify({sampleCapturedAt: sample.capturedAt, records}, null, 2) + "\n");
  console.log(`${records.length} items: ${records.filter(r => r.humanReviewed).length} current human reviews. Report does not approve content.`);
}
main().catch(() => {console.error("Report failed. Run audit:content first; check local review files."); process.exitCode = 1;});
