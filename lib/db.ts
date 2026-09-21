import { CONSTITUENCIES } from "@/lib/data/constituencies";
import { SEED_TEAMS } from "@/lib/data/seed-teams";
import {
  createEmptyStore,
  InMemoryConstituencyRepository,
  InMemorySettingsRepository,
  InMemoryTeamRepository,
  InMemoryVoteRepository,
  insertTeam,
  insertVote,
  type MemoryStore,
} from "@/lib/repositories/in-memory";
import type { Repositories } from "@/lib/repositories/types";

/**
 * Prototype database wiring.
 *
 * Records live in a plain object held on `globalThis` so Next.js dev-server hot
 * reloads reuse the same store instead of wiping votes on every file save.
 * A real process restart still clears everything — that is expected here and
 * documented in the README.
 */

/**
 * Seeded demo votes use phone numbers from this reserved block so they can
 * never collide with a number a real tester types in.
 */
const DEMO_PHONE_PREFIX = "70";

/** Vote volume per unit of a team's `demoVoteWeight`. */
const DEMO_VOTES_PER_WEIGHT = 38;

const DEMO_VOTER_NAMES = [
  "Rahul Yadav", "Priya Singh", "Mohd Shahid", "Anjali Verma", "Sunil Maurya",
  "Kavita Devi", "Arif Ansari", "Deepak Gupta", "Pooja Sharma", "Ramesh Bind",
  "Neha Tiwari", "Farhan Khan", "Sandeep Saroj", "Meena Kumari", "Ajay Pandey",
  "Shabana Parveen", "Vikas Chauhan", "Rekha Patel", "Nitesh Nishad", "Alok Jaiswal",
] as const;

/** Small deterministic PRNG so demo data is identical on every boot. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type BootstrapOptions = {
  /** Skip demo votes — used by tests that need a clean vote table. */
  withDemoVotes?: boolean;
  /** Injected so tests get stable timestamps. */
  now?: Date;
};

/**
 * Build a fully seeded store: nine constituencies (reference data), the demo
 * teams, and optionally a batch of demo votes so the UI is not empty on boot.
 */
export function bootstrapStore(options: BootstrapOptions = {}): MemoryStore {
  const { withDemoVotes = true, now = new Date() } = options;
  const store = createEmptyStore(now);
  const validConstituencyIds = new Set(CONSTITUENCIES.map((c) => c.id));
  const seeded: { id: string; weight: number; constituencyId: string }[] = [];

  for (const seed of SEED_TEAMS) {
    if (!validConstituencyIds.has(seed.constituencyId)) {
      throw new Error(`Seed team "${seed.name}" references unknown constituency.`);
    }
    const team = insertTeam(
      store,
      {
        name: seed.name,
        constituencyId: seed.constituencyId,
        captainName: seed.captainName,
        locality: seed.locality,
        shortDescription: seed.shortDescription,
        teamColor: seed.teamColor,
        playersCount: seed.playersCount,
        yearEstablished: seed.yearEstablished,
        active: true,
      },
      now,
    );
    seeded.push({
      id: team.id,
      weight: seed.demoVoteWeight,
      constituencyId: seed.constituencyId,
    });
  }

  if (withDemoVotes) {
    const random = mulberry32(20260921);
    let phoneCounter = 0;

    for (const { id, weight, constituencyId } of seeded) {
      const jitter = 0.85 + random() * 0.3;
      const count = Math.max(1, Math.round(weight * DEMO_VOTES_PER_WEIGHT * jitter));

      for (let i = 0; i < count; i += 1) {
        phoneCounter += 1;
        const phone = `${DEMO_PHONE_PREFIX}${String(phoneCounter).padStart(8, "0")}`;
        const voterName = DEMO_VOTER_NAMES[phoneCounter % DEMO_VOTER_NAMES.length];
        // Spread demo votes across the two weeks before boot.
        const castAt = new Date(now.getTime() - Math.floor(random() * 14 * 86_400_000));
        insertVote(store, { voterName, normalizedPhone: phone, teamId: id, constituencyId }, castAt);
      }
    }
  }

  return store;
}

export function createRepositories(store: MemoryStore): Repositories {
  return {
    constituencies: new InMemoryConstituencyRepository(),
    teams: new InMemoryTeamRepository(store),
    votes: new InMemoryVoteRepository(store),
    settings: new InMemorySettingsRepository(store),
  };
}

type GlobalWithStore = typeof globalThis & {
  __jaunpurNo1Store?: MemoryStore;
};

const globalRef = globalThis as GlobalWithStore;

/**
 * The application's repository set. Every server component, route handler and
 * server action goes through this — nothing imports the in-memory classes
 * directly.
 *
 * Only the *data* is held on `globalThis`; the repository objects are rebuilt
 * on each call. They are tiny, and keeping them out of the global cache means
 * an edit to a repository class takes effect on the next hot reload instead of
 * needing a server restart.
 */
export function getRepositories(): Repositories {
  if (!globalRef.__jaunpurNo1Store) {
    globalRef.__jaunpurNo1Store = bootstrapStore();
  }
  return createRepositories(globalRef.__jaunpurNo1Store);
}
