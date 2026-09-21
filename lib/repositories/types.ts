import type {
  Constituency,
  Team,
  TournamentSettings,
  Vote,
  VotingStatus,
} from "@/lib/domain/types";

/**
 * Repository contracts.
 *
 * Everything above this layer (services, server actions, pages) depends only on
 * these interfaces. `InMemory*Repository` satisfies them today; a Prisma-backed
 * implementation can satisfy them tomorrow with no changes upstream.
 *
 * All methods are async even though the in-memory versions resolve immediately,
 * so swapping in a real database never changes a call site.
 */

export interface ConstituencyRepository {
  list(): Promise<Constituency[]>;
  findById(id: string): Promise<Constituency | null>;
  findBySlug(slug: string): Promise<Constituency | null>;
}

export type TeamFilter = {
  constituencyId?: string;
  /** When true, only teams currently accepting votes are returned. */
  activeOnly?: boolean;
};

export type CreateTeamInput = {
  name: string;
  constituencyId: string;
  captainName: string;
  locality?: string;
  shortDescription?: string;
  teamColor?: string;
  playersCount?: number;
  yearEstablished?: number;
  active?: boolean;
};

export type UpdateTeamInput = Partial<Omit<CreateTeamInput, "constituencyId">> & {
  constituencyId?: string;
};

export interface TeamRepository {
  list(filter?: TeamFilter): Promise<Team[]>;
  findById(id: string): Promise<Team | null>;
  findBySlug(constituencyId: string, slug: string): Promise<Team | null>;
  create(input: CreateTeamInput): Promise<Team>;
  /** Throws `TeamNotFoundError` if the id does not exist. */
  update(id: string, patch: UpdateTeamInput): Promise<Team>;
  /**
   * Hard delete. Callers must confirm the team holds no votes first — the
   * vote-integrity rule lives in `lib/services/teams.ts`, not here.
   */
  delete(id: string): Promise<void>;
}

export type CreateVoteInput = {
  voterName: string;
  normalizedPhone: string;
  teamId: string;
  constituencyId: string;
};

export interface VoteRepository {
  /**
   * Check-then-insert as one uncancellable step.
   *
   * Throws `DuplicateVoteError` if the normalized phone already appears
   * anywhere in the tournament. A SQL implementation should back this with a
   * UNIQUE constraint on `normalized_phone` and translate the constraint
   * violation into the same error.
   */
  createUnique(input: CreateVoteInput): Promise<Vote>;
  existsForPhone(normalizedPhone: string): Promise<boolean>;
  countAll(): Promise<number>;
  /** teamId -> vote count, for every team that has at least one vote. */
  countsByTeam(): Promise<Map<string, number>>;
  /** constituencyId -> vote count. */
  countsByConstituency(): Promise<Map<string, number>>;
  countForTeam(teamId: string): Promise<number>;
  /** Newest first. Admin-only; never expose the result to public pages. */
  listRecent(limit: number): Promise<Vote[]>;
  /** Used when a team is hard-deleted so no orphan votes survive. */
  deleteForTeam(teamId: string): Promise<number>;
  /**
   * Keeps `vote.constituencyId` in step with its team when an admin moves the
   * team to a different Vidhan Sabha. Returns how many votes were rewritten.
   */
  reassignConstituency(teamId: string, constituencyId: string): Promise<number>;
}

export interface SettingsRepository {
  get(): Promise<TournamentSettings>;
  setVotingStatus(status: VotingStatus): Promise<TournamentSettings>;
}

export type Repositories = {
  constituencies: ConstituencyRepository;
  teams: TeamRepository;
  votes: VoteRepository;
  settings: SettingsRepository;
};
