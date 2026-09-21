import { VotingStatusPill } from "@/components/status-pill";
import type { TournamentStats as Stats } from "@/lib/domain/types";
import { formatCount } from "@/lib/utils";

/** Ground-scoreboard strip: four figures on one numeric grid. */
export function TournamentStats({ stats }: { stats: Stats }) {
  const cells = [
    { value: formatCount(stats.constituencyCount), label: "Vidhan Sabha" },
    { value: formatCount(stats.activeTeamCount), label: "Teams maidan mein" },
    { value: formatCount(stats.totalVotes), label: "Votes ab tak" },
    { value: "9", label: "Teams aage jaayengi" },
  ];

  return (
    <section aria-label="Tournament at a glance" className="border-b border-turf bg-ink-raised">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 divide-x divide-y divide-turf sm:grid-cols-4 sm:divide-y-0">
          {cells.map((cell) => (
            <div key={cell.label} className="px-1 py-6 first:pl-0 sm:px-5 sm:py-7">
              <dt className="text-[0.75rem] leading-snug text-chalk-faint sm:text-[0.8125rem]">
                {cell.label}
              </dt>
              <dd className="display tabular mt-2 text-[clamp(1.75rem,7vw,2.75rem)] text-floodlight">
                {cell.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-3 border-t border-turf py-4">
          <VotingStatusPill status={stats.votingStatus} />
          <p className="text-[0.8125rem] text-chalk-faint">
            {stats.votingStatus === "open"
              ? "Abhi vote kar sakte hain."
              : "Voting band ho chuki hai. Results dekhein."}
          </p>
        </div>
      </div>
    </section>
  );
}
