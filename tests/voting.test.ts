import { beforeEach, describe, expect, it } from "vitest";
import {
  DuplicateVoteError,
  InactiveTeamError,
  InvalidNameError,
  InvalidPhoneError,
  TeamNotFoundError,
  VotingClosedError,
} from "@/lib/domain/errors";
import type { Repositories } from "@/lib/repositories/types";
import { castVote } from "@/lib/services/voting";
import { freshRepositories, teamIn } from "./helpers";

describe("castVote", () => {
  let repositories: Repositories;

  beforeEach(() => {
    repositories = freshRepositories();
  });

  it("records the first vote and returns a safe receipt", async () => {
    const team = await teamIn(repositories, "badlapur");

    const receipt = await castVote(repositories, {
      voterName: "Rahul Yadav",
      phone: "9876543210",
      teamId: team.id,
    });

    expect(receipt.teamId).toBe(team.id);
    expect(receipt.constituencySlug).toBe("badlapur");
    expect(receipt.district).toBe("Jaunpur");
    expect(receipt.state).toBe("Uttar Pradesh");
    // The receipt must not leak the phone number back to the browser.
    expect(JSON.stringify(receipt)).not.toContain("9876543210");

    expect(await repositories.votes.countAll()).toBe(1);
    expect(await repositories.votes.countForTeam(team.id)).toBe(1);
  });

  it("takes the constituency from the team, never from the caller", async () => {
    const team = await teamIn(repositories, "kerakat");

    await castVote(repositories, {
      voterName: "Priya Singh",
      phone: "9812345678",
      // A constituency sent by a client would land here; CastVoteInput has no
      // such field, so the only source is the team record.
      teamId: team.id,
    });

    const [vote] = await repositories.votes.listRecent(1);
    expect(vote.constituencyId).toBe("kerakat");
    expect(vote.constituencyId).toBe(team.constituencyId);
  });

  it("rejects a second vote for another team in the same Vidhan Sabha", async () => {
    const first = await teamIn(repositories, "badlapur", 0);
    const second = await teamIn(repositories, "badlapur", 1);

    await castVote(repositories, {
      voterName: "Rahul Yadav",
      phone: "9876543210",
      teamId: first.id,
    });

    await expect(
      castVote(repositories, {
        voterName: "Rahul Yadav",
        phone: "9876543210",
        teamId: second.id,
      }),
    ).rejects.toBeInstanceOf(DuplicateVoteError);

    expect(await repositories.votes.countAll()).toBe(1);
    expect(await repositories.votes.countForTeam(second.id)).toBe(0);
  });

  it("rejects a second vote for a team in a different Vidhan Sabha", async () => {
    const badlapur = await teamIn(repositories, "badlapur");
    const shahganj = await teamIn(repositories, "shahganj");

    await castVote(repositories, {
      voterName: "Rahul Yadav",
      phone: "9876543210",
      teamId: badlapur.id,
    });

    await expect(
      castVote(repositories, {
        voterName: "Rahul Yadav",
        phone: "9876543210",
        teamId: shahganj.id,
      }),
    ).rejects.toBeInstanceOf(DuplicateVoteError);

    expect(await repositories.votes.countAll()).toBe(1);
  });

  it("treats every spelling of the same number as the same voter", async () => {
    const badlapur = await teamIn(repositories, "badlapur");
    const mariyahu = await teamIn(repositories, "mariyahu");

    await castVote(repositories, {
      voterName: "Rahul Yadav",
      phone: "+91 98765 43210",
      teamId: badlapur.id,
    });

    for (const spelling of ["9876543210", "+919876543210", "09876543210", "98765-43210"]) {
      await expect(
        castVote(repositories, {
          voterName: "Someone Else",
          phone: spelling,
          teamId: mariyahu.id,
        }),
        spelling,
      ).rejects.toBeInstanceOf(DuplicateVoteError);
    }

    expect(await repositories.votes.countAll()).toBe(1);
  });

  it("rejects votes for an inactive team", async () => {
    const team = await teamIn(repositories, "malhani");
    await repositories.teams.update(team.id, { active: false });

    await expect(
      castVote(repositories, {
        voterName: "Sunil Maurya",
        phone: "9812345678",
        teamId: team.id,
      }),
    ).rejects.toBeInstanceOf(InactiveTeamError);

    expect(await repositories.votes.countAll()).toBe(0);
  });

  it("rejects votes once voting is closed", async () => {
    const team = await teamIn(repositories, "zafarabad");
    await repositories.settings.setVotingStatus("closed");

    await expect(
      castVote(repositories, {
        voterName: "Sunil Maurya",
        phone: "9812345678",
        teamId: team.id,
      }),
    ).rejects.toBeInstanceOf(VotingClosedError);

    expect(await repositories.votes.countAll()).toBe(0);
  });

  it("rejects an unknown team", async () => {
    await expect(
      castVote(repositories, {
        voterName: "Sunil Maurya",
        phone: "9812345678",
        teamId: "team_does_not_exist",
      }),
    ).rejects.toBeInstanceOf(TeamNotFoundError);
  });

  it("rejects invalid names and phone numbers before touching the store", async () => {
    const team = await teamIn(repositories, "jaunpur");

    await expect(
      castVote(repositories, { voterName: "R", phone: "9876543210", teamId: team.id }),
    ).rejects.toBeInstanceOf(InvalidNameError);

    await expect(
      castVote(repositories, { voterName: "Rahul Yadav", phone: "12345", teamId: team.id }),
    ).rejects.toBeInstanceOf(InvalidPhoneError);

    expect(await repositories.votes.countAll()).toBe(0);
  });

  it("keeps counts derived from vote records as votes accumulate", async () => {
    const team = await teamIn(repositories, "machhli-shahar");
    const phones = ["9000000001", "9000000002", "9000000003"];

    for (const phone of phones) {
      await castVote(repositories, { voterName: "Demo Voter", phone, teamId: team.id });
    }

    expect(await repositories.votes.countForTeam(team.id)).toBe(phones.length);
    expect((await repositories.votes.countsByTeam()).get(team.id)).toBe(phones.length);
    expect((await repositories.votes.countsByConstituency()).get("machhli-shahar")).toBe(
      phones.length,
    );
  });

  it("lets concurrent submissions of the same number through exactly once", async () => {
    const team = await teamIn(repositories, "mungra-badshahpur");

    const attempts = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        castVote(repositories, {
          voterName: "Rahul Yadav",
          phone: "9876543210",
          teamId: team.id,
        }),
      ),
    );

    expect(attempts.filter((a) => a.status === "fulfilled")).toHaveLength(1);
    expect(await repositories.votes.countAll()).toBe(1);
  });
});
