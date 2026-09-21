import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LeaderboardRow, leaderMarks } from "@/components/leaderboard-row";
import { SelectionPill } from "@/components/status-pill";
import type { ConstituencyStandings } from "@/lib/domain/types";
import { cn, formatCount } from "@/lib/utils";

/**
 * Standings table for one Vidhan Sabha. `limit` trims the list on the results
 * page so nine constituencies stay scannable on a phone.
 */
export function Leaderboard({
  standings,
  limit,
  headingLevel = "h3",
  className,
}: {
  standings: ConstituencyStandings;
  limit?: number;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const { constituency, selection, totalVotes } = standings;
  const Heading = headingLevel;
  const marks = leaderMarks(selection);
  const rows = limit ? standings.standings.slice(0, limit) : standings.standings;
  const hidden = standings.standings.length - rows.length;

  return (
    <section className={cn("border border-turf bg-ink-raised", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-turf px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Heading className="display-tight truncate text-base text-chalk sm:text-lg">
            {constituency.name}
          </Heading>
          <SelectionPill selection={selection} />
        </div>
        <p className="tabular text-[0.8125rem] text-chalk-faint">
          {formatCount(totalVotes)} votes
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-chalk-dim sm:px-5">
          Is Vidhan Sabha ke teams jald hi announce honge.
        </p>
      ) : (
        <div className="divide-y divide-turf">
          {rows.map((standing) => (
            <LeaderboardRow
              key={standing.team.id}
              standing={standing}
              mark={marks.get(standing.team.id)}
            />
          ))}
        </div>
      )}

      <div className="border-t border-turf px-4 py-3 sm:px-5">
        <Link
          href={`/vidhan-sabha/${constituency.slug}`}
          className="inline-flex min-h-11 items-center gap-1 text-[0.8125rem] font-semibold text-floodlight hover:text-floodlight-soft"
        >
          {hidden > 0
            ? `Baaki ${hidden} team${hidden === 1 ? "" : "s"} dekhein`
            : `${constituency.name} ki teams`}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
