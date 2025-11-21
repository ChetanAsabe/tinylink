import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const url = await sql`SELECT * FROM urls WHERE slug = ${code}`;

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 500 });
    }

    return NextResponse.json(url);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const deleted = await sql`
        DELETE FROM urls
        WHERE slug = ${code}
        RETURNING *
    `;

    return NextResponse.json({ message: "Deleted", data: deleted });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
