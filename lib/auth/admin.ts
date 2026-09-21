import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { UnauthorizedError } from "@/lib/domain/errors";

/**
 * Prototype admin authentication.
 *
 * A single shared password from `ADMIN_PASSWORD` exchanges for an HMAC-signed,
 * HTTP-only session cookie. The password and the signing secret never reach the
 * browser bundle because this module is imported only from server code.
 *
 * NOT production authentication. Before any real deployment replace this with
 * per-user accounts, hashed credentials, a server-side session store, rotation
 * and rate limiting on the login endpoint.
 */

export const ADMIN_COOKIE = "jn1_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length > 0 ? value : null;
}

/** The signing key is derived from the password, so changing it logs everyone out. */
function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `jaunpur-no1:${adminPassword() ?? "unset"}`;
}

function sign(payload: string): string {
  return createHmac("sha256", signingSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** True when `ADMIN_PASSWORD` is configured; the login page explains it if not. */
export function isAdminConfigured(): boolean {
  return adminPassword() !== null;
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/** `<issuedAt>.<hmac>` — stateless, and invalid the moment the password changes. */
export function createSessionToken(issuedAtMs: number): string {
  const issuedAt = String(issuedAtMs);
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isSessionTokenValid(token: string | undefined, nowMs: number): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  if (!/^\d+$/.test(issuedAt)) return false;
  if (!safeEqual(signature, sign(issuedAt))) return false;
  const ageSeconds = (nowMs - Number(issuedAt)) / 1000;
  return ageSeconds >= 0 && ageSeconds < SESSION_MAX_AGE_SECONDS;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isSessionTokenValid(store.get(ADMIN_COOKIE)?.value, Date.now());
}

/**
 * Guard for every admin server action and route handler. Hiding the nav link is
 * not protection — this is.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) throw new UnauthorizedError();
}

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
