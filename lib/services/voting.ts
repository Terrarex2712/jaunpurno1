import {
  ConstituencyNotFoundError,
  InactiveTeamError,
  InvalidNameError,
  InvalidPhoneError,
  TeamNotFoundError,
  VotingClosedError,
} from "@/lib/domain/errors";
import type { CastVoteInput, VoteReceipt } from "@/lib/domain/types";
import type { Repositories } from "@/lib/repositories/types";
import { normalizePhone, normalizeVoterName } from "@/lib/services/phone";

/**
 * The one authoritative path for casting a vote.
 *
 * Client-side validation exists only to give fast feedback; every rule below is
 * re-checked here, on the server, for every request. In particular the vote's
 * constituency is read off the team record — the browser never gets to choose
 * which Vidhan Sabha a vote lands in.
 */
export async function castVote(
  repositories: Repositories,
  input: CastVoteInput,
): Promise<VoteReceipt> {
  // 1. Voter name.
  const voterName = normalizeVoterName(input.voterName);
  if (!voterName) throw new InvalidNameError();

  // 2. Phone number, collapsed to its canonical 10-digit form.
  const normalizedPhone = normalizePhone(input.phone);
  if (!normalizedPhone) throw new InvalidPhoneError();

  // 3. Voting has to be open.
  const settings = await repositories.settings.get();
  if (settings.votingStatus !== "open") throw new VotingClosedError();

  // 4 & 5. The team must exist and still be accepting votes.
  const team = await repositories.teams.findById(input.teamId);
  if (!team) throw new TeamNotFoundError();
  if (!team.active) throw new InactiveTeamError();

  // 6. Constituency comes from the team record, never from the request body.
  const constituency = await repositories.constituencies.findById(team.constituencyId);
  if (!constituency) throw new ConstituencyNotFoundError();

  // 7 & 8. The repository re-checks phone uniqueness immediately before
  // inserting, so the check and the write cannot be separated. It throws
  // DuplicateVoteError if this number has voted anywhere in the tournament.
  const vote = await repositories.votes.createUnique({
    voterName,
    normalizedPhone,
    teamId: team.id,
    constituencyId: constituency.id,
  });

  // 9. Only the voter's own confirmation goes back — never other voters' data.
  return {
    voteId: vote.id,
    teamId: team.id,
    teamName: team.name,
    constituencyName: constituency.name,
    constituencySlug: constituency.slug,
    district: vote.district,
    state: vote.state,
  };
}
