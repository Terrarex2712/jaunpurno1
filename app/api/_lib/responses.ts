import { NextResponse } from "next/server";
import { isDomainError } from "@/lib/domain/errors";

/**
 * Turns a thrown domain error into the matching HTTP status — 409 for a
 * duplicate vote, 404 for an unknown team, and so on. Unknown failures become
 * a plain 500 with no internal detail.
 */
export function errorResponse(error: unknown): NextResponse {
  if (isDomainError(error)) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  console.error("Unhandled API error", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
    { status: 500 },
  );
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json(
    { error: { code: "BAD_REQUEST", message } },
    { status: 400 },
  );
}
