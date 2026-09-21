import { describe, expect, it } from "vitest";
import { maskPhone, normalizePhone, normalizeVoterName } from "@/lib/services/phone";

describe("normalizePhone", () => {
  it("collapses every accepted spelling to the same 10 digits", () => {
    for (const input of [
      "9876543210",
      "+91 9876543210",
      "+919876543210",
      "98765 43210",
      "98765-43210",
      "09876543210",
      "0091 98765 43210",
      "  9876543210  ",
      "(98765) 43210",
    ]) {
      expect(normalizePhone(input), input).toBe("9876543210");
    }
  });

  it("keeps a genuine 10-digit number that happens to start with 91", () => {
    expect(normalizePhone("9188776655")).toBe("9188776655");
  });

  it("rejects numbers that are not Indian mobiles", () => {
    for (const input of [
      "",
      "12345",
      "987654321",
      "98765432101",
      "1234567890",
      "5876543210",
      "0000000000",
      "9999999999",
      "abcdefghij",
      "+1 415 555 0123",
    ]) {
      expect(normalizePhone(input), input).toBeNull();
    }
  });
});

describe("maskPhone", () => {
  it("shows only the first and last two digits", () => {
    expect(maskPhone("9876543210")).toBe("98******10");
  });
});

describe("normalizeVoterName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeVoterName("  Rahul   Yadav ")).toBe("Rahul Yadav");
  });

  it("rejects empty, too-short and non-name input", () => {
    for (const input of ["", " ", "R", "123", "<script>"]) {
      expect(normalizeVoterName(input), input).toBeNull();
    }
  });
});
