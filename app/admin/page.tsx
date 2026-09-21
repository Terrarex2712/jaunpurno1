import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ensureAdminPage } from "@/app/admin/_lib/guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminStats } from "@/components/admin/admin-stats";
import { Button } from "@/components/ui/button";
import { getRepositories } from "@/lib/db";
import { getAllStandings, getTournamentStats } from "@/lib/services/results";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** One-line summary of who is in front, for the dashboard list. */
function describeSelection(
  selection: Awaited<ReturnType<typeof getAllStandings>>[number]["selection"],
): string {
  switch (selection.kind) {
    case "leading":
      return selection.team.name;
    case "selected":
      return `${selection.team.name} (selected)`;
    case "tie":
      return selection.votingOpen
        ? `${selection.teams.length} teams tied`
        : `Tie — selection pending`;
    case "none":
      return "No votes yet";
  }
}

export default async function AdminDashboardPage() {
  await ensureAdminPage();

  const repositories = getRepositories();
  const [stats, standings] = await Promise.all([
    getTournamentStats(repositories),
    getAllStandings(repositories),
  ]);

  return (
    <div className="lg:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(1.75rem,6vw,2.75rem)] text-chalk">
              Dashboard
            </h1>
            <p className="mt-2 text-[0.9375rem] text-chalk-dim">
              Jaunpur No.1 — teams, votes aur voting status ek jagah.
            </p>
          </div>
          <Button asChild size="md">
            <Link href="/admin/teams/new">Add team</Link>
          </Button>
        </div>

        <div className="mt-8">
          <AdminStats stats={stats} />
        </div>

        <h2 className="display-tight mt-12 text-xl text-chalk">
          Vidhan Sabha overview
        </h2>

        <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {standings.map((entry) => (
            <li
              key={entry.constituency.id}
              className="flex flex-col border border-turf bg-pitch p-4"
            >
              <h3 className="display-tight text-base text-chalk">
                {entry.constituency.name}
              </h3>

              <dl className="mt-3 flex gap-6">
                <div>
                  <dd className="tabular text-lg font-semibold text-chalk">
                    {formatCount(entry.teamCount)}
                  </dd>
                  <dt className="text-[0.75rem] text-chalk-faint">teams</dt>
                </div>
                <div>
                  <dd className="tabular text-lg font-semibold text-floodlight">
                    {formatCount(entry.totalVotes)}
                  </dd>
                  <dt className="text-[0.75rem] text-chalk-faint">votes</dt>
                </div>
              </dl>

              <p className="mt-3 text-[0.8125rem] text-chalk-dim">
                <span className="text-chalk-faint">Leading:</span>{" "}
                {describeSelection(entry.selection)}
              </p>

              <div className="mt-4 pt-1">
                <Button asChild variant="subtle" size="sm">
                  <Link href={`/admin/teams?constituency=${entry.constituency.slug}`}>
                    Manage teams
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
