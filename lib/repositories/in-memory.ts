import { CONSTITUENCIES } from "@/lib/data/constituencies";
import {
  DuplicateTeamNameError,
  DuplicateVoteError,
  TeamNotFoundError,
} from "@/lib/domain/errors";
import {
  DISTRICT,
  STATE,
  type Constituency,
  type Team,
  type TournamentSettings,
  type Vote,
  type VotingStatus,
} from "@/lib/domain/types";
import type {
  ConstituencyRepository,
  CreateTeamInput,
  CreateVoteInput,
  SettingsRepository,
  TeamFilter,
  TeamRepository,
  UpdateTeamInput,
  VoteRepository,
} from "@/lib/repositories/types";

/**
 * In-memory storage.
 *
 * Holds every record for the lifetime of the Node process. Data is lost when
 * the server restarts — see the prototype limitations section of the README.
 */
export type MemoryStore = {
  teams: Map<string, Team>;
  votes: Map<string, Vote>;
  /** normalizedPhone -> voteId. The one-vote-per-number index. */
  phoneIndex: Map<string, string>;
  settings: TournamentSettings;
  sequences: { team: number; vote: number };
};

export function createEmptyStore(seedTime: Date): MemoryStore {
  return {
    teams: new Map(),
    votes: new Map(),
    phoneIndex: new Map(),
    settings: { votingStatus: "open", updatedAt: seedTime },
    sequences: { team: 0, vote: 0 },
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- Synchronous write primitives -------------------------------------------
//
// The repository classes and the bootstrap seeder both go through these, so a
// seeded team is built by exactly the same rules as one an admin adds.

function assertTeamNameAvailable(
  store: MemoryStore,
  name: string,
  constituencyId: string,
  ignoreId: string | null,
): void {
  const candidate = name.trim().toLowerCase();
  for (const team of store.teams.values()) {
    if (team.id === ignoreId) continue;
    if (team.constituencyId !== constituencyId) continue;
    if (team.name.trim().toLowerCase() === candidate) throw new DuplicateTeamNameError();
  }
}

function uniqueTeamSlug(
  store: MemoryStore,
  name: string,
  constituencyId: string,
  ignoreId: string | null,
): string {
  const base = slugify(name) || "team";
  const taken = (slug: string) =>
    [...store.teams.values()].some(
      (t) => t.id !== ignoreId && t.constituencyId === constituencyId && t.slug === slug,
    );
  let candidate = base;
  let counter = 2;
  while (taken(candidate)) candidate = `${base}-${counter++}`;
  return candidate;
}

export function insertTeam(store: MemoryStore, input: CreateTeamInput, now: Date): Team {
  assertTeamNameAvailable(store, input.name, input.constituencyId, null);
  const id = `team_${String(++store.sequences.team).padStart(4, "0")}`;
  const team: Team = {
    id,
    name: input.name,
    slug: uniqueTeamSlug(store, input.name, input.constituencyId, null),
    constituencyId: input.constituencyId,
    captainName: input.captainName,
    locality: input.locality,
    shortDescription: input.shortDescription,
    teamColor: input.teamColor,
    playersCount: input.playersCount,
    yearEstablished: input.yearEstablished,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.teams.set(id, team);
  return team;
}

export function patchTeam(
  store: MemoryStore,
  id: string,
  patch: UpdateTeamInput,
  now: Date,
): Team {
  const existing = store.teams.get(id);
  if (!existing) throw new TeamNotFoundError();

  const constituencyId = patch.constituencyId ?? existing.constituencyId;
  const name = patch.name ?? existing.name;
  const moved = name !== existing.name || constituencyId !== existing.constituencyId;
  if (moved) assertTeamNameAvailable(store, name, constituencyId, id);

  const updated: Team = {
    ...existing,
    ...patch,
    constituencyId,
    name,
    slug: moved ? uniqueTeamSlug(store, name, constituencyId, id) : existing.slug,
    updatedAt: now,
  };
  store.teams.set(id, updated);
  return updated;
}

/**
 * Check-then-insert as one synchronous step.
 *
 * Nothing can run between the phone lookup and the insert, so two concurrent
 * requests for the same number cannot both pass the check. This is the
 * in-memory stand-in for a UNIQUE index on `normalized_phone`.
 */
export function insertVote(store: MemoryStore, input: CreateVoteInput, now: Date): Vote {
  if (store.phoneIndex.has(input.normalizedPhone)) throw new DuplicateVoteError();

  const id = `vote_${String(++store.sequences.vote).padStart(6, "0")}`;
  const vote: Vote = {
    id,
    voterName: input.voterName,
    normalizedPhone: input.normalizedPhone,
    teamId: input.teamId,
    constituencyId: input.constituencyId,
    district: DISTRICT,
    state: STATE,
    createdAt: now,
  };
  store.votes.set(id, vote);
  store.phoneIndex.set(input.normalizedPhone, id);
  return vote;
}

// --- Constituencies ---------------------------------------------------------

export class InMemoryConstituencyRepository implements ConstituencyRepository {
  async list(): Promise<Constituency[]> {
    return [...CONSTITUENCIES];
  }

  async findById(id: string): Promise<Constituency | null> {
    return CONSTITUENCIES.find((c) => c.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Constituency | null> {
    return CONSTITUENCIES.find((c) => c.slug === slug) ?? null;
  }
}

// --- Teams ------------------------------------------------------------------

export class InMemoryTeamRepository implements TeamRepository {
  constructor(
    private readonly store: MemoryStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async list(filter: TeamFilter = {}): Promise<Team[]> {
    const teams = [...this.store.teams.values()].filter((team) => {
      if (filter.constituencyId && team.constituencyId !== filter.constituencyId) return false;
      if (filter.activeOnly && !team.active) return false;
      return true;
    });
    return teams.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Team | null> {
    return this.store.teams.get(id) ?? null;
  }

  async findBySlug(constituencyId: string, slug: string): Promise<Team | null> {
    for (const team of this.store.teams.values()) {
      if (team.constituencyId === constituencyId && team.slug === slug) return team;
    }
    return null;
  }

  async create(input: CreateTeamInput): Promise<Team> {
    return insertTeam(this.store, input, this.now());
  }

  async update(id: string, patch: UpdateTeamInput): Promise<Team> {
    return patchTeam(this.store, id, patch, this.now());
  }

  async delete(id: string): Promise<void> {
    if (!this.store.teams.delete(id)) throw new TeamNotFoundError();
  }
}

// --- Votes ------------------------------------------------------------------

export class InMemoryVoteRepository implements VoteRepository {
  constructor(
    private readonly store: MemoryStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async createUnique(input: CreateVoteInput): Promise<Vote> {
    return insertVote(this.store, input, this.now());
  }

  async existsForPhone(normalizedPhone: string): Promise<boolean> {
    return this.store.phoneIndex.has(normalizedPhone);
  }

  async countAll(): Promise<number> {
    return this.store.votes.size;
  }

  async countsByTeam(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const vote of this.store.votes.values()) {
      counts.set(vote.teamId, (counts.get(vote.teamId) ?? 0) + 1);
    }
    return counts;
  }

  async countsByConstituency(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const vote of this.store.votes.values()) {
      counts.set(vote.constituencyId, (counts.get(vote.constituencyId) ?? 0) + 1);
    }
    return counts;
  }

  async countForTeam(teamId: string): Promise<number> {
    let count = 0;
    for (const vote of this.store.votes.values()) {
      if (vote.teamId === teamId) count += 1;
    }
    return count;
  }

  async listRecent(limit: number): Promise<Vote[]> {
    return [...this.store.votes.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, Math.max(0, limit));
  }

  async reassignConstituency(teamId: string, constituencyId: string): Promise<number> {
    let moved = 0;
    for (const [id, vote] of this.store.votes) {
      if (vote.teamId !== teamId || vote.constituencyId === constituencyId) continue;
      this.store.votes.set(id, { ...vote, constituencyId });
      moved += 1;
    }
    return moved;
  }

  async deleteForTeam(teamId: string): Promise<number> {
    let removed = 0;
    for (const [id, vote] of this.store.votes) {
      if (vote.teamId !== teamId) continue;
      this.store.votes.delete(id);
      this.store.phoneIndex.delete(vote.normalizedPhone);
      removed += 1;
    }
    return removed;
  }
}

// --- Settings ---------------------------------------------------------------

export class InMemorySettingsRepository implements SettingsRepository {
  constructor(
    private readonly store: MemoryStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async get(): Promise<TournamentSettings> {
    return { ...this.store.settings };
  }

  async setVotingStatus(status: VotingStatus): Promise<TournamentSettings> {
    this.store.settings = { votingStatus: status, updatedAt: this.now() };
    return { ...this.store.settings };
  }
}
