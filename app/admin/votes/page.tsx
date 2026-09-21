import { ShieldCheck } from "lucide-react";
import { ensureAdminPage } from "@/app/admin/_lib/guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SelectionPill, VotingStatusPill } from "@/components/status-pill";
import { getRepositories } from "@/lib/db";
import { getAllStandings, getTournamentStats } from "@/lib/services/results";
import { maskPhone } from "@/lib/services/phone";
import { formatCount, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Votes" };

const RECENT_LIMIT = 25;

export default async function AdminVotesPage() {
  await ensureAdminPage();

  const repositories = getRepositories();
  const [standings, stats, recent, constituencyCounts] = await Promise.all([
    getAllStandings(repositories),
    getTournamentStats(repositories),
    repositories.votes.listRecent(RECENT_LIMIT),
    repositories.votes.countsByConstituency(),
  ]);

  const teams = await repositories.teams.list();
  const teamNames = new Map(teams.map((team) => [team.id, team.name]));
  const constituencyNames = new Map(
    standings.map((entry) => [entry.constituency.id, entry.constituency.name]),
  );

  return (
    <div className="lg:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(1.75rem,6vw,2.75rem)] text-chalk">Votes</h1>
            <p className="tabular mt-2 text-[0.9375rem] text-chalk-dim">
              {formatCount(stats.totalVotes)} total votes across{" "}
              {formatCount(stats.constituencyCount)} Vidhan Sabha.
            </p>
          </div>
          <VotingStatusPill status={stats.votingStatus} />
        </div>

        <p className="mt-6 flex max-w-3xl items-start gap-2.5 border border-turf bg-pitch p-3.5 text-[0.8125rem] leading-relaxed text-chalk-dim">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-floodlight" aria-hidden />
          Phone numbers yahan masked hain aur public pages par kabhi nahi
          dikhte. Kisi voter ne kis team ko vote kiya, yeh sirf is admin view
          mein hai — ise share na karein.
        </p>

        {/* --- Aggregated standings ------------------------------------- */}
        <h2 className="display-tight mt-12 text-xl text-chalk">By team</h2>

        <div className="mt-5 space-y-6">
          {standings.map((entry) => (
            <section key={entry.constituency.id} className="border border-turf">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-turf bg-ink-raised px-4 py-3">
                <h3 className="display-tight text-base text-chalk">
                  {entry.constituency.name}
                </h3>
                <div className="flex items-center gap-3">
                  <SelectionPill selection={entry.selection} />
                  <p className="tabular text-[0.8125rem] text-chalk-faint">
                    {formatCount(constituencyCounts.get(entry.constituency.id) ?? 0)} votes
                  </p>
                </div>
              </div>

              {entry.standings.length === 0 ? (
                <p className="px-4 py-6 text-[0.8125rem] text-chalk-dim">
                  Is Vidhan Sabha mein abhi koi team nahi hai.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[34rem] border-collapse text-left">
                    <caption className="sr-only">
                      {entry.constituency.name} vote totals by team
                    </caption>
                    <thead>
                      <tr className="border-b border-turf">
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint"
                        >
                          Team
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-[0.75rem] font-semibold text-chalk-faint"
                        >
                          Votes
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right text-[0.75rem] font-semibold text-chalk-faint"
                        >
                          Percentage
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-turf bg-pitch">
                      {entry.standings.map((standing) => (
                        <tr key={standing.team.id}>
                          <th
                            scope="row"
                            className="px-4 py-2.5 text-[0.875rem] font-medium text-chalk"
                          >
                            <span className="tabular mr-2 text-chalk-faint">
                              {standing.rank}.
                            </span>
                            {standing.team.name}
                          </th>
                          <td className="tabular px-4 py-2.5 text-right text-[0.875rem] text-chalk">
                            {formatCount(standing.votes)}
                          </td>
                          <td className="tabular px-4 py-2.5 text-right text-[0.875rem] text-chalk-dim">
                            {standing.percentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2.5 text-[0.8125rem] text-chalk-dim">
                            {standing.team.active ? "Active" : "Inactive"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* --- Recent voters, phone numbers masked ----------------------- */}
        <h2 className="display-tight mt-12 text-xl text-chalk">
          Recent votes
          <span className="ml-2 text-[0.8125rem] font-normal text-chalk-faint">
            (last {RECENT_LIMIT})
          </span>
        </h2>

        {recent.length === 0 ? (
          <p className="mt-5 border border-dashed border-crease bg-pitch/50 px-4 py-10 text-center text-[0.875rem] text-chalk-dim">
            Abhi tak koi vote submit nahi hua hai.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto border border-turf">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="sr-only">
                Most recent votes with masked phone numbers
              </caption>
              <thead>
                <tr className="border-b border-turf bg-ink-raised">
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint">
                    Voter
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint">
                    Team
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint">
                    Vidhan Sabha
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-[0.75rem] font-semibold text-chalk-faint">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-turf bg-pitch">
                {recent.map((vote) => (
                  <tr key={vote.id}>
                    <th scope="row" className="px-4 py-2.5 text-[0.875rem] font-medium text-chalk">
                      {vote.voterName}
                    </th>
                    <td className="tabular px-4 py-2.5 text-[0.875rem] text-chalk-dim">
                      {maskPhone(vote.normalizedPhone)}
                    </td>
                    <td className="px-4 py-2.5 text-[0.875rem] text-chalk-dim">
                      {teamNames.get(vote.teamId) ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[0.875rem] text-chalk-dim">
                      {constituencyNames.get(vote.constituencyId) ?? "—"}
                    </td>
                    <td className="tabular px-4 py-2.5 text-[0.8125rem] text-chalk-faint">
                      {formatDate(vote.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
