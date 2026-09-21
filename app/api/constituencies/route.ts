import { NextResponse } from "next/server";
import { errorResponse } from "@/app/api/_lib/responses";
import { getRepositories } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/constituencies — the nine fixed Vidhan Sabha regions. */
export async function GET() {
  try {
    const constituencies = await getRepositories().constituencies.list();
    return NextResponse.json({ constituencies });
  } catch (error) {
    return errorResponse(error);
  }
}
