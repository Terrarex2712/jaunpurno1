import Link from "next/link";
import { ChevronRight, Minus, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import { ScoreboardRail } from "@/components/brand-mark";
import { TeamMonogram } from "@/components/team-monogram";
import type { ConstituencyStandings, SelectionState } from "@/lib/domain/types";
import { formatCount } from "@/lib/utils";

/** The front team in each area, read straight off the resolved selection. */
function front(selection: SelectionState) {
  switch (selection.kind) {
    case "leading":
      return { name: selection.team.name, color: selection.team.teamColor, votes: selection.votes, icon: TrendingUp, note: "Leading" };
    case "selected":
      return { name: selection.team.name, color: selection.team.teamColor, votes: selection.votes, icon: Trophy, note: "Selected" };
    case "tie":
      return {
        name: `${selection.teams.length} teams barabar`,
        color: undefined,
        votes: selection.votes,
        icon: selection.votingOpen ? Minus : ShieldCheck,
        note: selection.votingOpen ? "Tied" : "Pending",
      };
    case "none":
      return { name: "Abhi koi vote nahi", color: undefined, votes: 0, icon: Minus, note: "—" };
  }
}

/**
 * Who is in front in each of the nine areas, on one screen. Deliberately
 * compact — the full table lives on /results.
 */
export function LiveLeaders({ standings }: { standings: ConstituencyStandings[] }) {
  return (
    <section
      aria-labelledby="live-leaders-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <ScoreboardRail className="mb-10" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2
            id="live-leaders-heading"
            className="display text-[clamp(2rem,7vw,3.25rem)] text-chalk"
          >
            Abhi kaun aage hai
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
            Har Vidhan Sabha se sabse aage chal rahi team. Voting khulne tak yeh
            badalta rahega.
          </p>
        </div>
        <Link
          href="/results"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-floodlight hover:text-floodlight-soft"
        >
          Poori standings
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {standings.map((entry) => {
          const lead = front(entry.selection);
          const Icon = lead.icon;
          return (
            <li key={entry.constituency.id}>
              <Link
                href={`/vidhan-sabha/${entry.constituency.slug}`}
                className="group flex items-center gap-3 border border-turf bg-pitch p-3.5 transition-colors hover:border-crease hover:bg-ink-raised"
              >
                <TeamMonogram
                  name={lead.name}
                  color={lead.color}
                  size="sm"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.75rem] text-chalk-faint">
                    {entry.constituency.name}
                  </p>
                  <p className="truncate text-[0.875rem] font-semibold text-chalk">
                    {lead.name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular text-[0.875rem] font-semibold text-floodlight">
                    {formatCount(lead.votes)}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1 text-[0.6875rem] text-chalk-faint">
                    <Icon className="h-3 w-3" aria-hidden />
                    {lead.note}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
