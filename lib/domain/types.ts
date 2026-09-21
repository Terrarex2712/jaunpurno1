/**
 * Core domain models for Jaunpur No.1.
 *
 * These types are storage-agnostic on purpose: the in-memory repositories in
 * `lib/repositories` are the only place that knows how records are persisted.
 * Swapping in Prisma/PostgreSQL later means writing new repository classes
 * against the same interfaces — nothing in `app/` or `components/` changes.
 */

/** The tournament is locked to a single district for the whole prototype. */
export const DISTRICT = "Jaunpur" as const;
export const STATE = "Uttar Pradesh" as const;

export type District = typeof DISTRICT;
export type State = typeof STATE;

/** One of the nine Vidhan Sabha regions of Jaunpur district. Fixed seed data. */
export type Constituency = {
  id: string;
  name: string;
  slug: string;
  district: District;
  state: State;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  constituencyId: string;
  captainName: string;
  locality?: string;
  shortDescription?: string;
  /** Reserved for a future image-upload feature; unused by the prototype UI. */
  logo?: string;
  teamColor?: string;
  playersCount?: number;
  yearEstablished?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Vote = {
  id: string;
  voterName: string;
  /** Always 10 digits. This is the uniqueness key across the whole tournament. */
  normalizedPhone: string;
  teamId: string;
  /** Copied from the team record server-side — never from browser input. */
  constituencyId: string;
  district: District;
  state: State;
  createdAt: Date;
};

export type VotingStatus = "open" | "closed";

export type TournamentSettings = {
  votingStatus: VotingStatus;
  updatedAt: Date;
};

/** Input accepted by the vote service. `constituencyId` is deliberately absent. */
export type CastVoteInput = {
  voterName: string;
  phone: string;
  teamId: string;
};

/** Everything the browser is allowed to know about a vote it just cast. */
export type VoteReceipt = {
  voteId: string;
  teamName: string;
  teamId: string;
  constituencyName: string;
  constituencySlug: string;
  district: District;
  state: State;
};

/** A team plus its derived standing inside its own constituency. */
export type TeamStanding = {
  team: Team;
  votes: number;
  /** 0-100, rounded to one decimal. 0 when the constituency has no votes yet. */
  percentage: number;
  /** 1-based. Teams tied on votes share the same rank. */
  rank: number;
};

/**
 * Who represents a constituency.
 * - `leading`  — voting is open, so this is provisional.
 * - `selected` — voting closed with a single highest scorer.
 * - `tie`      — several teams share the top score. While voting is open this
 *                is just a scoreline; once it closes, a human must decide.
 * - `none`     — no votes cast at all.
 */
export type SelectionState =
  | { kind: "leading"; team: Team; votes: number }
  | { kind: "selected"; team: Team; votes: number }
  | { kind: "tie"; teams: Team[]; votes: number; votingOpen: boolean }
  | { kind: "none" };

export type ConstituencyStandings = {
  constituency: Constituency;
  standings: TeamStanding[];
  totalVotes: number;
  teamCount: number;
  selection: SelectionState;
};

export type TournamentStats = {
  constituencyCount: number;
  teamCount: number;
  activeTeamCount: number;
  totalVotes: number;
  votingStatus: VotingStatus;
};
