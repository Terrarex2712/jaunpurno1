import { NextResponse, type NextRequest } from "next/server";
import { badRequest, errorResponse } from "@/app/api/_lib/responses";
import { getRepositories } from "@/lib/db";
import { castVote } from "@/lib/services/voting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/votes — cast one vote.
 *
 * Accepts only `voterName`, `phone` and `teamId`. A constituency sent by the
 * client is ignored: `castVote` reads it off the team record. Duplicate phone
 * numbers come back as 409.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be JSON.");
  }

  if (typeof body !== "object" || body === null) {
    return badRequest("Request body must be a JSON object.");
  }

  const { voterName, phone, teamId } = body as Record<string, unknown>;
  if (typeof voterName !== "string" || typeof phone !== "string" || typeof teamId !== "string") {
    return badRequest("voterName, phone and teamId are required strings.");
  }

  try {
    const receipt = await castVote(getRepositories(), { voterName, phone, teamId });
    return NextResponse.json({ vote: receipt }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
