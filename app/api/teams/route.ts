import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/app/api/_lib/responses";
import { ConstituencyNotFoundError } from "@/lib/domain/errors";
import { getRepositories } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teams              — every active team
 * GET /api/teams?constituency=badlapur — active teams in one Vidhan Sabha
 */
export async function GET(request: NextRequest) {
  try {
    const repositories = getRepositories();
    const slug = request.nextUrl.searchParams.get("constituency");

    let constituencyId: string | undefined;
    if (slug) {
      const constituency = await repositories.constituencies.findBySlug(slug);
      if (!constituency) throw new ConstituencyNotFoundError();
      constituencyId = constituency.id;
    }

    const [teams, countsByTeam] = await Promise.all([
      repositories.teams.list({ constituencyId, activeOnly: true }),
      repositories.votes.countsByTeam(),
    ]);

    return NextResponse.json({
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        constituencyId: team.constituencyId,
        captainName: team.captainName,
        locality: team.locality ?? null,
        shortDescription: team.shortDescription ?? null,
        teamColor: team.teamColor ?? null,
        votes: countsByTeam.get(team.id) ?? 0,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
