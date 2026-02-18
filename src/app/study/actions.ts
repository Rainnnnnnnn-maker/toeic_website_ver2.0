'use server';

import { getWordDetail } from "@/actions/word";

export async function fetchWordDetail(slug: string) {
  try {
    return await getWordDetail(slug);
  } catch (error) {
    console.error("Failed to fetch word detail:", error);
    return null;
  }
}
