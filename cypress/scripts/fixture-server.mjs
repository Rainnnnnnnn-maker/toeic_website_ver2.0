import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

// Nine words deliberately exceed today's six picks, catching all-word fallback.
const corpus = JSON.parse(await readFile(new URL("../fixtures/words.json", import.meta.url), "utf8"));
const words = new Set(Object.values(corpus).flat());

export async function startFixtureServer() {
  const unexpected = [];
  const requests = { blob: 0, redis: 0 };
  const server = createServer(async (req, res) => {
    try {
      const level = req.url?.match(/^\/blob\/(important|medium|high)$/)?.[1];
      if (req.method === "GET" && level) {
        requests.blob++;
        res.setHeader("Content-Type", "text/plain");
        res.end(corpus[level].join("\n"));
        return;
      }
      if (req.method === "POST" && ["/", "/pipeline"].includes(req.url)) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const commands = req.url === "/pipeline" ? body : [body];
        const results = commands.map(([command, key]) => {
          const word = typeof key === "string" ? key.replace(/^word:/, "") : "";
          if (command.toLowerCase() !== "get" || !key.startsWith("word:") || !words.has(word)) {
            throw new Error("Unexpected Redis command or key");
          }
          requests.redis++;
          const detail = JSON.stringify({
            word,
            pronunciation: "/test/",
            japaneseTranslation: "テスト用の訳",
            englishDefinition: `A test definition of ${word}.`,
            meanings: [{ partOfSpeech: "名詞", meaning: "テスト用の意味", detailedMeanings: [] }],
            wordForms: [], synonyms: [], nuance: "E2E fixture",
            toeicExamples: [{ english: `We study ${word} today.`, japanese: "今日はこの単語を学習します。" }],
          });
          return { result: req.headers["upstash-encoding"] === "base64"
            ? Buffer.from(detail).toString("base64") : detail };
        });
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(req.url === "/pipeline" ? results : results[0]));
        return;
      }
      throw new Error(`Unexpected fixture request: ${req.method} ${req.url?.split("?")[0]}`);
    } catch (error) {
      unexpected.push(error.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unsupported E2E fixture request" }));
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    assertUsed() {
      if (unexpected.length || requests.blob < 3 || requests.redis === 0) {
        throw new Error(`Fixture verification failed: ${JSON.stringify({ unexpected, requests })}`);
      }
    },
    close: () => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }),
  };
}
