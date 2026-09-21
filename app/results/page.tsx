import type { Metadata } from "next";
import { Info } from "lucide-react";
import { Leaderboard } from "@/components/leaderboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VotingStatusPill } from "@/components/status-pill";
import { getRepositories } from "@/lib/db";
import { getAllStandings, getTournamentStats } from "@/lib/services/results";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Live Team Standings",
  description:
    "Jaunpur No.1 live standings — dekhiye har Vidhan Sabha mein kaunsi cricket team sabse aage chal rahi hai.",
};

export default async function ResultsPage() {
  const repositories = getRepositories();
  const [standings, stats] = await Promise.all([
    getAllStandings(repositories),
    getTournamentStats(repositories),
  ]);

  const open = stats.votingStatus === "open";

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden border-b border-turf">
          <span className="beam beam-left opacity-60" aria-hidden="true" />
          <span className="beam beam-right opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="display text-[clamp(2.25rem,8.5vw,4.5rem)] text-chalk">
              Jaunpur No.1
              <span className="block text-floodlight">Live Team Standings</span>
            </h1>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
              Dekhiye har Vidhan Sabha mein kaunsi team chal rahi hai sabse aage.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <VotingStatusPill status={stats.votingStatus} />
              <p className="tabular text-[0.8125rem] text-chalk-faint">
                {formatCount(stats.totalVotes)} total votes —{" "}
                {formatCount(stats.activeTeamCount)} teams —{" "}
                {formatCount(stats.constituencyCount)} Vidhan Sabha
              </p>
            </div>

            <p
              role="status"
              className="mt-7 flex max-w-2xl items-start gap-2.5 border border-turf bg-pitch p-3.5 text-[0.8125rem] leading-relaxed text-chalk-dim"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-floodlight" aria-hidden />
              {open
                ? "Voting abhi khuli hai, isliye yeh standings badalti rahengi. Jo team aage hai use abhi 'selected' nahi kaha ja sakta."
                : "Voting band ho chuki hai. Har Vidhan Sabha se sabse zyada valid votes paane wali team selected team hai. Barabar votes hone par selection pending rahega."}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="sr-only">Standings by Vidhan Sabha</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {standings.map((entry) => (
              <Leaderboard
                key={entry.constituency.id}
                standings={entry}
                limit={3}
                headingLevel="h3"
              />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
