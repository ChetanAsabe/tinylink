import { sql } from "@/lib/db";
import { generateUniqueSlug, isValidUrl } from "@/lib/url";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL.", status: 400 });
    }

    const slug = generateUniqueSlug();
    const shortenURL = `${BASE_URL}/${slug}`;
    const res = await saveUrl(url, slug, shortenURL);

    return NextResponse.json({
      slug: slug,
      originalUrl: url,
      shortUrl: `${BASE_URL}/${slug}`,
      createdAt: new Date().toDateString(),
      data: res,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  async function saveUrl(url: string, slug: string, shorten_url: string) {
    try {
      await sql`INSERT INTO urls (slug, original_url, shorten_url) VALUES (${slug}, ${url}, ${shorten_url})`;
    } catch (error) {
      console.error("Error saving URL : ", error);
    }
  }
}

export async function GET() {
  try {
    const urls = await sql`SELECT * FROM urls`;
    return NextResponse.json(urls);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
