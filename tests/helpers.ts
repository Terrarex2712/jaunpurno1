import { bootstrapStore, createRepositories } from "@/lib/db";
import type { Repositories } from "@/lib/repositories/types";
import type { Team } from "@/lib/domain/types";

/** Fixed clock so seeded records are identical in every run. */
export const TEST_NOW = new Date("2026-09-01T10:00:00.000Z");

/** A fresh, isolated repository set seeded with teams but no votes. */
export function freshRepositories(): Repositories {
  return createRepositories(bootstrapStore({ withDemoVotes: false, now: TEST_NOW }));
}

/** First team in a constituency, by name. Throws rather than returning undefined. */
export async function teamIn(
  repositories: Repositories,
  constituencyId: string,
  index = 0,
): Promise<Team> {
  const teams = await repositories.teams.list({ constituencyId });
  const team = teams[index];
  if (!team) throw new Error(`No team at index ${index} in ${constituencyId}`);
  return team;
}
