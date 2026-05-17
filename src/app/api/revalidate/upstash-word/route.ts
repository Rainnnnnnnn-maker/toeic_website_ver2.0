import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cacheKeyForWord, deleteWordDetails } from "@/lib/wordCache";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const key = request.nextUrl.searchParams.get("key");
  const secret = process.env.REVALIDATION_TOKEN;

  if (!secret || !token || token !== secret) {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  if (!key) {
    return NextResponse.json(
      { message: "Missing key parameter" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (!key.startsWith("word:")) {
    return NextResponse.json(
      { message: "Only word:* keys are allowed" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  if (key.length > 200 || /[\r\n\t]/.test(key)) {
    return NextResponse.json(
      { message: "Invalid key format" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const rawSlug = key.slice("word:".length);
  if (!rawSlug.trim()) {
    return NextResponse.json(
      { message: "Invalid key format" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const removed = await deleteWordDetails(rawSlug);
    const normalizedKey = cacheKeyForWord(rawSlug);
    return NextResponse.json(
      {
        deleted: removed === 1,
        key,
        normalizedKey,
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Failed to delete Upstash word key:", error);
    return NextResponse.json(
      { message: "Failed to delete Upstash word key" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
