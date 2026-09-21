import { beforeEach, describe, expect, it } from "vitest";
import type { Repositories } from "@/lib/repositories/types";
import { getConstituencyStandings, getTournamentStats } from "@/lib/services/results";
import { createTeam } from "@/lib/services/teams";
import { castVote } from "@/lib/services/voting";
import { freshRepositories, teamIn } from "./helpers";

/** Casts `count` votes for a team using distinct, valid phone numbers. */
async function castMany(
  repositories: Repositories,
  teamId: string,
  count: number,
  offset: number,
): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await castVote(repositories, {
      voterName: "Demo Voter",
      phone: `9${String(offset + i).padStart(9, "0")}`,
      teamId,
    });
  }
}

describe("standings", () => {
  let repositories: Repositories;

  beforeEach(() => {
    repositories = freshRepositories();
  });

  it("reports zero votes without dividing by zero", async () => {
    const standings = await getConstituencyStandings(repositories, "badlapur");

    expect(standings.totalVotes).toBe(0);
    expect(standings.selection).toEqual({ kind: "none" });
    for (const entry of standings.standings) {
      expect(entry.votes).toBe(0);
      expect(entry.percentage).toBe(0);
      expect(Number.isFinite(entry.percentage)).toBe(true);
    }
  });

  it("ranks by votes and computes percentages that sum to 100", async () => {
    const first = await teamIn(repositories, "badlapur", 0);
    const second = await teamIn(repositories, "badlapur", 1);

    await castMany(repositories, first.id, 6, 100_000_000);
    await castMany(repositories, second.id, 4, 200_000_000);

    const standings = await getConstituencyStandings(repositories, "badlapur");

    expect(standings.totalVotes).toBe(10);
    expect(standings.standings[0].team.id).toBe(first.id);
    expect(standings.standings[0].rank).toBe(1);
    expect(standings.standings[0].percentage).toBe(60);
    expect(standings.standings[1].percentage).toBe(40);
  });

  it("calls the front-runner 'leading' while voting is open", async () => {
    const team = await teamIn(repositories, "malhani");
    await castMany(repositories, team.id, 3, 300_000_000);

    const standings = await getConstituencyStandings(repositories, "malhani");
    expect(standings.selection.kind).toBe("leading");
  });

  it("calls the front-runner 'selected' only once voting closes", async () => {
    const team = await teamIn(repositories, "malhani");
    await castMany(repositories, team.id, 3, 400_000_000);
    await repositories.settings.setVotingStatus("closed");

    const standings = await getConstituencyStandings(repositories, "malhani");
    expect(standings.selection).toMatchObject({ kind: "selected", votes: 3 });
  });

  it("leaves a closed tie pending instead of picking a winner", async () => {
    const first = await teamIn(repositories, "kerakat", 0);
    const second = await teamIn(repositories, "kerakat", 1);

    await castMany(repositories, first.id, 5, 500_000_000);
    await castMany(repositories, second.id, 5, 600_000_000);
    await repositories.settings.setVotingStatus("closed");

    const standings = await getConstituencyStandings(repositories, "kerakat");

    expect(standings.selection.kind).toBe("tie");
    if (standings.selection.kind === "tie") {
      expect(standings.selection.teams).toHaveLength(2);
      expect(standings.selection.votes).toBe(5);
      expect(standings.selection.votingOpen).toBe(false);
    }
    // Tied teams share rank 1.
    expect(standings.standings[0].rank).toBe(1);
    expect(standings.standings[1].rank).toBe(1);
  });

  it("keeps counting votes held by a deactivated team", async () => {
    const team = await teamIn(repositories, "jaunpur");
    await castMany(repositories, team.id, 4, 700_000_000);
    await repositories.teams.update(team.id, { active: false });

    const standings = await getConstituencyStandings(repositories, "jaunpur");
    const entry = standings.standings.find((s) => s.team.id === team.id);

    expect(entry?.votes).toBe(4);
    expect(standings.totalVotes).toBe(4);
    // The inactive team is excluded from the "teams taking part" figure.
    expect(standings.teamCount).toBe(3);
  });

  it("hides a deactivated team that never received a vote", async () => {
    const created = await createTeam(repositories, {
      name: "Withdrawn XI",
      captainName: "Demo Captain",
      constituencyId: "shahganj",
      active: false,
    });

    const standings = await getConstituencyStandings(repositories, "shahganj");
    expect(standings.standings.some((s) => s.team.id === created.id)).toBe(false);
  });

  it("totals the tournament from vote records", async () => {
    const a = await teamIn(repositories, "badlapur");
    const b = await teamIn(repositories, "kerakat");
    await castMany(repositories, a.id, 2, 800_000_000);
    await castMany(repositories, b.id, 3, 900_000_000);

    const stats = await getTournamentStats(repositories);

    expect(stats.constituencyCount).toBe(9);
    expect(stats.totalVotes).toBe(5);
    expect(stats.votingStatus).toBe("open");
    expect(stats.teamCount).toBeGreaterThanOrEqual(27);
  });
});
