import { NextResponse } from "next/server";
import { errorResponse } from "@/app/api/_lib/responses";
import { getRepositories } from "@/lib/db";
import { getAllStandings, getTournamentStats } from "@/lib/services/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/results — aggregated standings only.
 * Individual vote records are never exposed through a public endpoint.
 */
export async function GET() {
  try {
    const repositories = getRepositories();
    const [standings, stats] = await Promise.all([
      getAllStandings(repositories),
      getTournamentStats(repositories),
    ]);

    return NextResponse.json({
      votingStatus: stats.votingStatus,
      totalVotes: stats.totalVotes,
      constituencies: standings.map((entry) => ({
        id: entry.constituency.id,
        name: entry.constituency.name,
        slug: entry.constituency.slug,
        totalVotes: entry.totalVotes,
        teamCount: entry.teamCount,
        selection:
          entry.selection.kind === "tie"
            ? {
                kind: entry.selection.kind,
                votes: entry.selection.votes,
                teams: entry.selection.teams.map((t) => ({ id: t.id, name: t.name })),
              }
            : entry.selection.kind === "none"
              ? { kind: entry.selection.kind }
              : {
                  kind: entry.selection.kind,
                  votes: entry.selection.votes,
                  team: { id: entry.selection.team.id, name: entry.selection.team.name },
                },
        standings: entry.standings.map((standing) => ({
          rank: standing.rank,
          teamId: standing.team.id,
          teamName: standing.team.name,
          votes: standing.votes,
          percentage: standing.percentage,
        })),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
