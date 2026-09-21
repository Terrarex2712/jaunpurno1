import type { Metadata } from "next";
import { ConstituencyGrid } from "@/components/constituency-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VotingStatusPill } from "@/components/status-pill";
import { getRepositories } from "@/lib/db";
import { getAllStandings, getTournamentStats } from "@/lib/services/results";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Sabhi Vidhan Sabha",
  description:
    "Jaunpur district ki nau Vidhan Sabha regions — har kshetra ki cricket teams aur ab tak ke votes ek jagah.",
};

export default async function VidhanSabhaIndexPage() {
  const repositories = getRepositories();
  const [standings, stats] = await Promise.all([
    getAllStandings(repositories),
    getTournamentStats(repositories),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-24 md:pb-0">
        <section className="relative overflow-hidden border-b border-turf">
          <span className="beam beam-right opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-[0.8125rem] text-chalk-faint">
              Jaunpur, Uttar Pradesh
            </p>
            <h1 className="display mt-3 text-[clamp(2.25rem,9vw,4.5rem)] text-chalk">
              Apni Vidhan Sabha chunein
            </h1>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
              Nau kshetra, kai teams, ek vote. Apne area ki teams dekhein aur
              apni pasand ki team ko vote karein.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <VotingStatusPill status={stats.votingStatus} />
              <p className="tabular text-[0.8125rem] text-chalk-faint">
                {formatCount(stats.activeTeamCount)} teams —{" "}
                {formatCount(stats.totalVotes)} votes ab tak
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <ConstituencyGrid standings={standings} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
