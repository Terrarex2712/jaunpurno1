/**
 * Extension point for OTP verification.
 *
 * NOT IMPLEMENTED in this prototype. Nothing in the UI claims a number has been
 * verified, because nothing verifies it. This interface exists so an SMS
 * provider can be introduced later without reworking the vote flow:
 *
 *   1. Implement `PhoneVerificationService` against an SMS gateway.
 *   2. Add a challenge step to the vote dialog (send code -> confirm code).
 *   3. Have `castVote` require a verification token before writing the vote.
 *
 * TODO(production): a public voting system also needs per-IP rate limiting and
 * a bot check (CAPTCHA / Turnstile) alongside OTP. None of that is built here.
 */
export interface PhoneVerificationService {
  /** Send a one-time code to the number. Returns an opaque challenge id. */
  startVerification(normalizedPhone: string): Promise<{ challengeId: string }>;
  /** Confirm a code against a challenge. Returns a token `castVote` can trust. */
  confirmVerification(challengeId: string, code: string): Promise<{ token: string }>;
  /** Validate a token issued by `confirmVerification` for this number. */
  isVerified(normalizedPhone: string, token: string): Promise<boolean>;
}

/**
 * The prototype's stand-in: it verifies nothing and says so. Wire a real
 * implementation in here when OTP is added; call sites stay unchanged.
 */
export const phoneVerification: PhoneVerificationService | null = null;

/** True once an OTP provider is configured. Drives UI copy — currently false. */
export const PHONE_VERIFICATION_ENABLED = phoneVerification !== null;
