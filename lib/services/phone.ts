/**
 * Indian mobile number handling.
 *
 * The normalized 10-digit form is the uniqueness key for the whole tournament,
 * so normalization has to be total and deterministic: every accepted spelling
 * of the same number must collapse to exactly one string.
 */

/** All-same-digit numbers (9999999999) are treated as obviously invalid input. */
const REPEATED_DIGITS = /^(\d)\1{9}$/;

/** Indian mobile numbers are 10 digits and start with 6, 7, 8 or 9. */
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/**
 * Collapse any accepted spelling to 10 digits, or return `null` if the input
 * is not a usable Indian mobile number.
 *
 * Accepted: `9876543210`, `+91 9876543210`, `+919876543210`, `98765 43210`,
 * `098765-43210`, `0091 9876543210`.
 */
export function normalizePhone(raw: string): string | null {
  if (typeof raw !== "string") return null;

  let digits = raw.replace(/\D/g, "");

  // Country-code and trunk-prefix forms. Length is checked alongside the
  // prefix so a genuine 10-digit number beginning "91" survives untouched.
  if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 13 && digits.startsWith("091")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);

  if (!INDIAN_MOBILE.test(digits)) return null;
  if (REPEATED_DIGITS.test(digits)) return null;

  return digits;
}

export function isValidIndianMobile(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

/**
 * Admin-facing display form: `98******10`.
 * Never render an unmasked phone number anywhere in the UI.
 */
export function maskPhone(normalized: string): string {
  if (normalized.length !== 10) return "**********";
  return `${normalized.slice(0, 2)}******${normalized.slice(-2)}`;
}

/** Trims and collapses whitespace; returns `null` if nothing usable remains. */
export function normalizeVoterName(raw: string): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60) return null;
  // Latin letters, spaces and the punctuation that shows up in Indian names.
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) return null;
  return name;
}
