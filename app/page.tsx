import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ScoreboardRail } from "@/components/brand-mark";
import { ConstituencyGrid } from "@/components/constituency-grid";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { LiveLeaders } from "@/components/live-leaders";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SponsorSection } from "@/components/sponsor-badge";
import { StickyVoteCta } from "@/components/sticky-vote-cta";
import { TournamentStats } from "@/components/tournament-stats";
import { getRepositories } from "@/lib/db";
import { getAllStandings, getTournamentStats } from "@/lib/services/results";

// Votes change the numbers on this page, so it is rendered per request.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const repositories = getRepositories();
  const [stats, standings] = await Promise.all([
    getTournamentStats(repositories),
    getAllStandings(repositories),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-24 md:pb-0">
        <Hero stats={stats} />
        <TournamentStats stats={stats} />

        <section
          id="vidhan-sabha"
          aria-labelledby="vidhan-sabha-heading"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
        >
          <ScoreboardRail className="mb-10" />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2
                id="vidhan-sabha-heading"
                className="display text-[clamp(2rem,7vw,3.25rem)] text-chalk"
              >
                Nau Vidhan Sabha
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
                Apna kshetra chunein aur wahan ki participating teams dekhein.
                Har kshetra se ek team tournament tak jaayegi.
              </p>
            </div>
            <Link
              href="/vidhan-sabha"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-floodlight hover:text-floodlight-soft"
            >
              Sabhi Vidhan Sabha
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ConstituencyGrid standings={standings} className="mt-8" />
        </section>

        <HowItWorks />
        <LiveLeaders standings={standings} />
        <SponsorSection />
        <FinalCta votingStatus={stats.votingStatus} />
      </main>
      <SiteFooter />
      {stats.votingStatus === "open" && <StickyVoteCta />}
    </>
  );
}
