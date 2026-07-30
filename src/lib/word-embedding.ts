import "server-only";
import type { Word } from "@/data/words";
import type { WordDetails } from "@/types/word";
import { buildEmbeddingText } from "./semantic-search";
import { embedText } from "./embeddings";
import { getVectorIndex } from "./vector";

/**
 * 1単語分の WordDetails を embedding 化して Upstash Vector に upsert する。
 * WordDetails を再生成した後（/api/revalidate/word?vector=true）に呼び出し、
 * ベクトルと表示内容のズレを防ぐ。
 */
export async function upsertWordEmbedding(word: Word, detail: WordDetails): Promise<void> {
  const text = buildEmbeddingText(word.term, detail);
  const vector = await embedText(text, "RETRIEVAL_DOCUMENT");
  await getVectorIndex().upsert({
    id: word.slug,
    vector,
    metadata: {
      slug: word.slug,
      term: word.term,
      level: word.level,
      japaneseTranslation: detail.japaneseTranslation ?? "",
    },
  });
}
