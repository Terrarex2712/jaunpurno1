import { ConstituencyNotFoundError } from "@/lib/domain/errors";
import type {
  ConstituencyStandings,
  SelectionState,
  Team,
  TeamStanding,
  TournamentStats,
  VotingStatus,
} from "@/lib/domain/types";
import type { Repositories } from "@/lib/repositories/types";

/**
 * Standings are always derived from vote records — no counter is ever
 * incremented alongside a vote, so the two can never drift apart.
 */

/**
 * Rank a constituency's teams. Teams tied on votes share a rank
 * (10, 10, 8 ranks as 1, 1, 3) and are ordered alphabetically among themselves.
 */
function rankTeams(teams: Team[], countsByTeam: Map<string, number>): TeamStanding[] {
  const withVotes = teams
    .map((team) => ({ team, votes: countsByTeam.get(team.id) ?? 0 }))
    .sort((a, b) => b.votes - a.votes || a.team.name.localeCompare(b.team.name));

  const totalVotes = withVotes.reduce((sum, entry) => sum + entry.votes, 0);

  let lastVotes: number | null = null;
  let lastRank = 0;

  return withVotes.map((entry, index) => {
    if (entry.votes !== lastVotes) {
      lastRank = index + 1;
      lastVotes = entry.votes;
    }
    return {
      team: entry.team,
      votes: entry.votes,
      percentage: totalVotes === 0 ? 0 : Math.round((entry.votes / totalVotes) * 1000) / 10,
      rank: lastRank,
    };
  });
}

function resolveSelection(
  standings: TeamStanding[],
  votingStatus: VotingStatus,
): SelectionState {
  const topVotes = standings[0]?.votes ?? 0;
  if (topVotes === 0) return { kind: "none" };

  const leaders = standings.filter((s) => s.votes === topVotes);
  if (leaders.length > 1) {
    return {
      kind: "tie",
      teams: leaders.map((s) => s.team),
      votes: topVotes,
      votingOpen: votingStatus === "open",
    };
  }

  // A single clear top scorer. While voting is open this is provisional and is
  // never labelled "selected" anywhere in the UI.
  return {
    kind: votingStatus === "open" ? "leading" : "selected",
    team: leaders[0].team,
    votes: topVotes,
  };
}

/**
 * Teams shown for a constituency: everything currently active, plus any
 * deactivated team that still holds votes — those votes are real and must keep
 * counting towards the totals.
 */
function visibleTeams(teams: Team[], countsByTeam: Map<string, number>): Team[] {
  return teams.filter((team) => team.active || (countsByTeam.get(team.id) ?? 0) > 0);
}

export async function getConstituencyStandings(
  repositories: Repositories,
  constituencyId: string,
): Promise<ConstituencyStandings> {
  const constituency = await repositories.constituencies.findById(constituencyId);
  if (!constituency) throw new ConstituencyNotFoundError();

  const [allTeams, countsByTeam, settings] = await Promise.all([
    repositories.teams.list({ constituencyId }),
    repositories.votes.countsByTeam(),
    repositories.settings.get(),
  ]);

  const teams = visibleTeams(allTeams, countsByTeam);
  const standings = rankTeams(teams, countsByTeam);
  const totalVotes = standings.reduce((sum, entry) => sum + entry.votes, 0);

  return {
    constituency,
    standings,
    totalVotes,
    teamCount: allTeams.filter((t) => t.active).length,
    selection: resolveSelection(standings, settings.votingStatus),
  };
}

/** Standings for all nine constituencies, in the canonical seed order. */
export async function getAllStandings(
  repositories: Repositories,
): Promise<ConstituencyStandings[]> {
  const [constituencies, allTeams, countsByTeam, settings] = await Promise.all([
    repositories.constituencies.list(),
    repositories.teams.list(),
    repositories.votes.countsByTeam(),
    repositories.settings.get(),
  ]);

  return constituencies.map((constituency) => {
    const own = allTeams.filter((team) => team.constituencyId === constituency.id);
    const standings = rankTeams(visibleTeams(own, countsByTeam), countsByTeam);
    return {
      constituency,
      standings,
      totalVotes: standings.reduce((sum, entry) => sum + entry.votes, 0),
      teamCount: own.filter((t) => t.active).length,
      selection: resolveSelection(standings, settings.votingStatus),
    };
  });
}

export async function getTournamentStats(
  repositories: Repositories,
): Promise<TournamentStats> {
  const [constituencies, teams, totalVotes, settings] = await Promise.all([
    repositories.constituencies.list(),
    repositories.teams.list(),
    repositories.votes.countAll(),
    repositories.settings.get(),
  ]);

  return {
    constituencyCount: constituencies.length,
    teamCount: teams.length,
    activeTeamCount: teams.filter((t) => t.active).length,
    totalVotes,
    votingStatus: settings.votingStatus,
  };
}
