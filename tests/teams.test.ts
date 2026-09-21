import { beforeEach, describe, expect, it } from "vitest";
import {
  ConstituencyNotFoundError,
  InvalidNameError,
  TeamHasVotesError,
} from "@/lib/domain/errors";
import type { Repositories } from "@/lib/repositories/types";
import { createTeam, deleteTeam, setTeamActive, updateTeam } from "@/lib/services/teams";
import { castVote } from "@/lib/services/voting";
import { freshRepositories, teamIn } from "./helpers";

describe("team administration", () => {
  let repositories: Repositories;

  beforeEach(() => {
    repositories = freshRepositories();
  });

  it("creates a team with a slug and an active default", async () => {
    const team = await createTeam(repositories, {
      name: "Jaunpur Test XI",
      captainName: "Demo Captain",
      constituencyId: "jaunpur",
    });

    expect(team.slug).toBe("jaunpur-test-xi");
    expect(team.active).toBe(true);
    expect(await repositories.teams.findById(team.id)).not.toBeNull();
  });

  it("rejects a team outside the nine fixed Vidhan Sabha regions", async () => {
    await expect(
      createTeam(repositories, {
        name: "Lucknow Lions",
        captainName: "Demo Captain",
        constituencyId: "lucknow",
      }),
    ).rejects.toBeInstanceOf(ConstituencyNotFoundError);
  });

  it("rejects an empty team or captain name", async () => {
    await expect(
      createTeam(repositories, { name: "", captainName: "Demo Captain", constituencyId: "jaunpur" }),
    ).rejects.toBeInstanceOf(InvalidNameError);

    await expect(
      createTeam(repositories, { name: "Valid Team", captainName: "", constituencyId: "jaunpur" }),
    ).rejects.toBeInstanceOf(InvalidNameError);
  });

  it("hard-deletes a team that has no votes", async () => {
    const team = await createTeam(repositories, {
      name: "Temporary XI",
      captainName: "Demo Captain",
      constituencyId: "kerakat",
    });

    await deleteTeam(repositories, team.id);
    expect(await repositories.teams.findById(team.id)).toBeNull();
  });

  it("refuses to hard-delete a team that already has votes", async () => {
    const team = await teamIn(repositories, "badlapur");
    await castVote(repositories, {
      voterName: "Rahul Yadav",
      phone: "9876543210",
      teamId: team.id,
    });

    await expect(deleteTeam(repositories, team.id)).rejects.toBeInstanceOf(TeamHasVotesError);

    // Both the team and its vote survive the refused delete.
    expect(await repositories.teams.findById(team.id)).not.toBeNull();
    expect(await repositories.votes.countAll()).toBe(1);
  });

  it("keeps existing votes when a team is deactivated", async () => {
    const team = await teamIn(repositories, "shahganj");
    await castVote(repositories, {
      voterName: "Priya Singh",
      phone: "9812345678",
      teamId: team.id,
    });

    const updated = await setTeamActive(repositories, team.id, false);

    expect(updated.active).toBe(false);
    expect(await repositories.votes.countForTeam(team.id)).toBe(1);
  });

  it("moves a team's votes with it when its Vidhan Sabha changes", async () => {
    const team = await teamIn(repositories, "mariyahu");
    await castVote(repositories, {
      voterName: "Arif Ansari",
      phone: "9812345678",
      teamId: team.id,
    });

    await updateTeam(repositories, team.id, {
      name: team.name,
      captainName: team.captainName,
      constituencyId: "zafarabad",
    });

    const counts = await repositories.votes.countsByConstituency();
    expect(counts.get("mariyahu") ?? 0).toBe(0);
    expect(counts.get("zafarabad")).toBe(1);
  });
});
