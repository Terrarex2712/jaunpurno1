import { CONSTITUENCY_IDS } from "@/lib/data/constituencies";
import {
  ConstituencyNotFoundError,
  InvalidNameError,
  TeamHasVotesError,
  TeamNotFoundError,
} from "@/lib/domain/errors";
import type { Team } from "@/lib/domain/types";
import type { CreateTeamInput, Repositories, UpdateTeamInput } from "@/lib/repositories/types";

/**
 * Admin-side team operations. Validation lives here rather than in the form so
 * a direct POST is held to exactly the same rules as the UI.
 */

export type TeamFormInput = {
  name: string;
  captainName: string;
  constituencyId: string;
  locality?: string;
  shortDescription?: string;
  active?: boolean;
};

function cleanText(value: string | undefined, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function validate(input: TeamFormInput): CreateTeamInput {
  const name = cleanText(input.name, 60);
  if (!name || name.length < 3) {
    throw new InvalidNameError("Team name must be at least 3 characters.");
  }

  const captainName = cleanText(input.captainName, 60);
  if (!captainName || captainName.length < 3) {
    throw new InvalidNameError("Captain name must be at least 3 characters.");
  }

  if (!CONSTITUENCY_IDS.includes(input.constituencyId)) {
    throw new ConstituencyNotFoundError("Select one of the nine Vidhan Sabha regions.");
  }

  return {
    name,
    captainName,
    constituencyId: input.constituencyId,
    locality: cleanText(input.locality, 60),
    shortDescription: cleanText(input.shortDescription, 200),
    active: input.active ?? true,
  };
}

export async function createTeam(
  repositories: Repositories,
  input: TeamFormInput,
): Promise<Team> {
  return repositories.teams.create(validate(input));
}

export async function updateTeam(
  repositories: Repositories,
  id: string,
  input: TeamFormInput,
): Promise<Team> {
  const existing = await repositories.teams.findById(id);
  if (!existing) throw new TeamNotFoundError();

  const patch: UpdateTeamInput = validate(input);
  const updated = await repositories.teams.update(id, patch);

  // A vote always belongs to whichever Vidhan Sabha its team belongs to, so
  // moving the team carries its existing votes with it.
  if (updated.constituencyId !== existing.constituencyId) {
    await repositories.votes.reassignConstituency(updated.id, updated.constituencyId);
  }

  return updated;
}

export async function setTeamActive(
  repositories: Repositories,
  id: string,
  active: boolean,
): Promise<Team> {
  const existing = await repositories.teams.findById(id);
  if (!existing) throw new TeamNotFoundError();
  return repositories.teams.update(id, { active });
}

/**
 * Vote integrity rule: a team that has received votes is never hard-deleted,
 * because deleting it would silently destroy real votes. The admin has to
 * deactivate it instead, which stops new votes while keeping the record.
 */
export async function deleteTeam(repositories: Repositories, id: string): Promise<void> {
  const existing = await repositories.teams.findById(id);
  if (!existing) throw new TeamNotFoundError();

  const votes = await repositories.votes.countForTeam(id);
  if (votes > 0) {
    throw new TeamHasVotesError(
      `${existing.name} has ${votes} vote${votes === 1 ? "" : "s"}. Deactivate it instead of deleting it.`,
    );
  }

  // Clears any vote rows for the team as well. With the guard above this is a
  // no-op, but it keeps the delete path from ever leaving orphaned votes.
  await repositories.votes.deleteForTeam(id);
  await repositories.teams.delete(id);
}
