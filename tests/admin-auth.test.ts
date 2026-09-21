import { beforeEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  isAdminConfigured,
  isSessionTokenValid,
  verifyAdminPassword,
} from "@/lib/auth/admin";

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

describe("admin session tokens", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-password";
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("reports whether a password is configured", () => {
    expect(isAdminConfigured()).toBe(true);
    delete process.env.ADMIN_PASSWORD;
    expect(isAdminConfigured()).toBe(false);
  });

  it("accepts only the configured password", () => {
    expect(verifyAdminPassword("test-password")).toBe(true);
    expect(verifyAdminPassword("wrong")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
  });

  it("accepts a freshly issued token and rejects tampering", () => {
    const now = Date.parse("2026-09-21T12:00:00.000Z");
    const token = createSessionToken(now);

    expect(isSessionTokenValid(token, now)).toBe(true);
    expect(isSessionTokenValid(token, now + 1000)).toBe(true);

    const [issuedAt, signature] = token.split(".");
    expect(isSessionTokenValid(`${issuedAt}.${"0".repeat(signature.length)}`, now)).toBe(false);
    expect(isSessionTokenValid(`${Number(issuedAt) + 1}.${signature}`, now)).toBe(false);
    expect(isSessionTokenValid("not-a-token", now)).toBe(false);
    expect(isSessionTokenValid(undefined, now)).toBe(false);
  });

  it("expires a token after eight hours", () => {
    const now = Date.parse("2026-09-21T12:00:00.000Z");
    const token = createSessionToken(now);

    expect(isSessionTokenValid(token, now + EIGHT_HOURS_MS - 1000)).toBe(true);
    expect(isSessionTokenValid(token, now + EIGHT_HOURS_MS + 1000)).toBe(false);
  });

  it("invalidates existing tokens when the password changes", () => {
    const now = Date.parse("2026-09-21T12:00:00.000Z");
    const token = createSessionToken(now);

    process.env.ADMIN_PASSWORD = "a-different-password";
    expect(isSessionTokenValid(token, now)).toBe(false);
  });
});
