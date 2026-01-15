import type { MetadataRoute } from "next";
import { getAllWords } from "@/data/words";

const BASE_URL = "https://www.toeic-words.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/study`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const allWords = await getAllWords();
  const wordRoutes: MetadataRoute.Sitemap = allWords.map((w) => ({
    url: `${BASE_URL}/words/${w.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...wordRoutes];
}

