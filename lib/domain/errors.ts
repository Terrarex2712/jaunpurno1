/**
 * Typed domain errors.
 *
 * Every failure a caller can reasonably act on gets its own class so route
 * handlers and server actions can map them to HTTP semantics without string
 * matching. `code` is what crosses the wire; `message` stays server-side.
 */

export type DomainErrorCode =
  | "INVALID_NAME"
  | "INVALID_PHONE"
  | "TEAM_NOT_FOUND"
  | "INACTIVE_TEAM"
  | "DUPLICATE_VOTE"
  | "VOTING_CLOSED"
  | "CONSTITUENCY_NOT_FOUND"
  | "TEAM_HAS_VOTES"
  | "DUPLICATE_TEAM_NAME"
  | "UNAUTHORIZED";

/**
 * Globally registered brand.
 *
 * Next.js can evaluate the same module in more than one bundle (a server
 * component graph and a route-handler graph), which gives two distinct
 * `DomainError` classes. Because the repositories are cached on `globalThis`,
 * an error thrown inside one graph is inspected in the other, and `instanceof`
 * would be false there. `Symbol.for` resolves to the same symbol in every
 * graph, so the check below stays correct.
 */
const DOMAIN_ERROR = Symbol.for("jaunpur-no1.domain-error");

export class DomainError extends Error {
  readonly [DOMAIN_ERROR] = true;
  readonly code: DomainErrorCode;
  /** Suggested HTTP status for route handlers. */
  readonly status: number;

  constructor(code: DomainErrorCode, message: string, status: number) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
  }
}

export class InvalidNameError extends DomainError {
  constructor(message = "Voter name is invalid.") {
    super("INVALID_NAME", message, 400);
  }
}

export class InvalidPhoneError extends DomainError {
  constructor(message = "Phone number is not a valid Indian mobile number.") {
    super("INVALID_PHONE", message, 400);
  }
}

export class TeamNotFoundError extends DomainError {
  constructor(message = "Team not found.") {
    super("TEAM_NOT_FOUND", message, 404);
  }
}

export class InactiveTeamError extends DomainError {
  constructor(message = "Team is not accepting votes.") {
    super("INACTIVE_TEAM", message, 409);
  }
}

/**
 * Raised when the normalized phone has already voted anywhere in the
 * tournament. The message is intentionally free of any detail about the
 * earlier vote — see the privacy rules in the README.
 */
export class DuplicateVoteError extends DomainError {
  constructor(message = "A vote already exists for this phone number.") {
    super("DUPLICATE_VOTE", message, 409);
  }
}

export class VotingClosedError extends DomainError {
  constructor(message = "Voting is closed.") {
    super("VOTING_CLOSED", message, 409);
  }
}

export class ConstituencyNotFoundError extends DomainError {
  constructor(message = "Vidhan Sabha not found.") {
    super("CONSTITUENCY_NOT_FOUND", message, 404);
  }
}

/** Guards vote integrity: a team holding votes must be deactivated, not deleted. */
export class TeamHasVotesError extends DomainError {
  constructor(message = "Team has votes and cannot be deleted.") {
    super("TEAM_HAS_VOTES", message, 409);
  }
}

export class DuplicateTeamNameError extends DomainError {
  constructor(message = "Another team in this Vidhan Sabha already uses this name.") {
    super("DUPLICATE_TEAM_NAME", message, 409);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Admin authentication required.") {
    super("UNAUTHORIZED", message, 401);
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<symbol, unknown>)[DOMAIN_ERROR] === true
  );
}
