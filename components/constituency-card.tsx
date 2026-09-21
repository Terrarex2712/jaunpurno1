import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SelectionPill } from "@/components/status-pill";
import type { ConstituencyStandings } from "@/lib/domain/types";
import { cn, formatCount } from "@/lib/utils";

/**
 * One Vidhan Sabha at a glance. The whole card is the link, so the tap target
 * is the full panel rather than a small text link at the bottom.
 */
export function ConstituencyCard({
  standings,
  className,
}: {
  standings: ConstituencyStandings;
  className?: string;
}) {
  const { constituency, teamCount, totalVotes, selection } = standings;
  const leader =
    selection.kind === "leading" || selection.kind === "selected" ? selection.team : null;

  return (
    <Link
      href={`/vidhan-sabha/${constituency.slug}`}
      className={cn(
        "group relative flex min-h-[9.5rem] flex-col justify-between border border-turf bg-pitch p-4 transition-colors hover:border-crease hover:bg-ink-raised sm:p-5",
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-0.5 bg-crease transition-colors group-hover:bg-floodlight"
        aria-hidden="true"
      />

      <div>
        <h3 className="display-tight pr-6 text-[1.0625rem] text-chalk sm:text-lg">
          {constituency.name}
        </h3>
        <ChevronRight
          className="absolute right-4 top-4 h-4 w-4 text-chalk-faint transition-transform group-hover:translate-x-0.5 group-hover:text-floodlight"
          aria-hidden
        />

        <dl className="mt-4 flex items-end gap-5">
          <div>
            <dd className="display tabular text-xl text-chalk">{formatCount(teamCount)}</dd>
            <dt className="mt-0.5 text-[0.75rem] text-chalk-faint">Teams</dt>
          </div>
          <div>
            <dd className="display tabular text-xl text-floodlight">
              {formatCount(totalVotes)}
            </dd>
            <dt className="mt-0.5 text-[0.75rem] text-chalk-faint">Votes</dt>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        {leader ? (
          <p className="truncate text-[0.8125rem] text-chalk-dim">
            <span className="text-chalk-faint">
              {selection.kind === "selected" ? "Selected:" : "Aage:"}
            </span>{" "}
            <span className="text-chalk">{leader.name}</span>
          </p>
        ) : (
          <SelectionPill selection={selection} />
        )}
      </div>
    </Link>
  );
}
