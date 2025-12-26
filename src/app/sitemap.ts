import type { MetadataRoute } from "next";
import { getAllWords } from "@/data/words";

const BASE_URL = "https://toeic-words.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const wordRoutes: MetadataRoute.Sitemap = getAllWords().map((w) => ({
    url: `${BASE_URL}/words/${w.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...wordRoutes];
}

