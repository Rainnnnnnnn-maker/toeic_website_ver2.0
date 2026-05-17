import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cacheKeyForWord, deleteWordDetails } from "@/lib/wordCache";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const key = request.nextUrl.searchParams.get("key");
  const secret = process.env.REVALIDATION_TOKEN;

  if (!secret || token !== secret) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  if (!key) {
    return NextResponse.json({ message: "Missing key parameter" }, { status: 400 });
  }

  if (!key.startsWith("word:")) {
    return NextResponse.json({ message: "Only word:* keys are allowed" }, { status: 400 });
  }

  if (key.length > 200 || /[\r\n\t]/.test(key)) {
    return NextResponse.json({ message: "Invalid key format" }, { status: 400 });
  }

  const rawSlug = key.slice("word:".length);
  if (!rawSlug.trim()) {
    return NextResponse.json({ message: "Invalid key format" }, { status: 400 });
  }

  try {
    await deleteWordDetails(rawSlug);
    const normalizedKey = cacheKeyForWord(rawSlug);
    return NextResponse.json({
      deleted: true,
      key,
      normalizedKey,
    });
  } catch (error) {
    console.error("Failed to delete Upstash word key:", error);
    return NextResponse.json(
      { message: "Failed to delete Upstash word key" },
      { status: 500 },
    );
  }
}
