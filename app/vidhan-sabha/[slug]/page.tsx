import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronLeft, Info } from "lucide-react";
import { ScoreboardRail } from "@/components/brand-mark";
import { CONSTITUENCIES } from "@/lib/data/constituencies";
import { Leaderboard } from "@/components/leaderboard";
import { leaderMarks } from "@/components/leaderboard-row";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SelectionPill, VotingStatusPill } from "@/components/status-pill";
import { TeamCard } from "@/components/team-card";
import { getRepositories } from "@/lib/db";
import { getConstituencyStandings } from "@/lib/services/results";
import { formatCount } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * The nine constituencies are fixed reference data, so the router itself can
 * reject an unknown slug with a real 404 before this page ever runs. That needs
 * the static param list, which `dynamic = "force-dynamic"` would switch off —
 * so the page opts into per-request rendering with `connection()` instead, and
 * still reads live vote counts on every request.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CONSTITUENCIES.map((constituency) => ({ slug: constituency.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const constituency = await getRepositories().constituencies.findBySlug(slug);
  if (!constituency) return { title: "Vidhan Sabha nahi mili" };

  return {
    title: `${constituency.name} Cricket Teams`,
    description: `${constituency.name} (Jaunpur, Uttar Pradesh) ki participating cricket teams dekhein aur apni pasand ki team ko vote karein.`,
    openGraph: {
      title: `${constituency.name} Cricket Teams | Jaunpur No.1`,
      description: `${constituency.name} ki No.1 team kaun hogi? Teams dekhein aur vote karein.`,
    },
  };
}

export default async function ConstituencyPage({ params }: PageProps) {
  // Vote counts change between requests, so never serve this from the build.
  await connection();

  const { slug } = await params;
  const repositories = getRepositories();

  const constituency = await repositories.constituencies.findBySlug(slug);
  if (!constituency) notFound();

  const [standings, settings] = await Promise.all([
    getConstituencyStandings(repositories, constituency.id),
    repositories.settings.get(),
  ]);

  const votingOpen = settings.votingStatus === "open";
  const marks = leaderMarks(standings.selection);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-24 md:pb-0">
        <section className="relative overflow-hidden border-b border-turf">
          <span className="beam beam-left opacity-70" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <Link
              href="/vidhan-sabha"
              className="inline-flex min-h-11 items-center gap-1 text-[0.8125rem] font-medium text-chalk-dim hover:text-floodlight"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Sabhi Vidhan Sabha
            </Link>

            <p className="mt-4 text-[0.8125rem] text-chalk-faint">
              {constituency.district}, {constituency.state}
            </p>
            <h1 className="display mt-2 text-[clamp(2.25rem,9vw,4.5rem)] text-chalk">
              {constituency.name}
              <span className="block text-floodlight">Cricket Teams</span>
            </h1>
            <p className="display-tight mt-5 text-[clamp(1.125rem,4vw,1.5rem)] text-chalk-dim">
              {constituency.name} ki No.1 team kaun hogi?
            </p>

            <dl className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-5">
              <div>
                <dd className="display tabular text-2xl text-chalk">
                  {formatCount(standings.teamCount)}
                </dd>
                <dt className="mt-1 text-[0.75rem] text-chalk-faint">Teams</dt>
              </div>
              <div>
                <dd className="display tabular text-2xl text-floodlight">
                  {formatCount(standings.totalVotes)}
                </dd>
                <dt className="mt-1 text-[0.75rem] text-chalk-faint">Total votes</dt>
              </div>
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <VotingStatusPill status={settings.votingStatus} />
                <SelectionPill selection={standings.selection} />
              </div>
            </dl>

            {!votingOpen && (
              <p
                role="status"
                className="mt-6 flex items-start gap-2 border border-leather/40 bg-leather/10 p-3 text-[0.8125rem] text-leather-soft"
              >
                <Info className="mt-px h-4 w-4 shrink-0" aria-hidden />
                Voting band ho chuki hai. Ab sirf results dekhe ja sakte hain.
              </p>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          {standings.standings.length === 0 ? (
            <div className="border border-dashed border-crease bg-pitch/50 px-6 py-16 text-center">
              <h2 className="display-tight text-xl text-chalk">
                Teams jald hi announce hongi
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-chalk-dim">
                Is Vidhan Sabha ke teams jald hi announce honge. Tab tak baaki
                kshetra ki teams dekhein.
              </p>
              <Link
                href="/vidhan-sabha"
                className="mt-6 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-floodlight hover:text-floodlight-soft"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Sabhi Vidhan Sabha
              </Link>
            </div>
          ) : (
            <>
              <h2 className="sr-only">Participating teams</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {standings.standings.map((standing) => (
                  <li key={standing.team.id} className="flex">
                    <TeamCard
                      standing={standing}
                      constituencyName={constituency.name}
                      votingOpen={votingOpen}
                      mark={marks.get(standing.team.id)}
                    />
                  </li>
                ))}
              </ul>

              <ScoreboardRail className="my-14" />

              <h2 className="display text-[clamp(1.75rem,6vw,2.5rem)] text-chalk">
                {constituency.name} standings
              </h2>
              <p className="mt-3 text-[0.9375rem] text-chalk-dim">
                Sabse zyada valid votes paane wali team apne kshetra ki selected
                team banegi.
              </p>
              <Leaderboard standings={standings} className="mt-6" headingLevel="h3" />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
