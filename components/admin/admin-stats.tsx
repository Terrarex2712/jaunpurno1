import { VotingStatusPill } from "@/components/status-pill";
import { setVotingStatusAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { TournamentStats } from "@/lib/domain/types";
import { formatCount } from "@/lib/utils";

export function AdminStats({ stats }: { stats: TournamentStats }) {
  const cells = [
    { label: "Total constituencies", value: formatCount(stats.constituencyCount) },
    { label: "Total teams", value: formatCount(stats.teamCount) },
    { label: "Active teams", value: formatCount(stats.activeTeamCount) },
    { label: "Total votes", value: formatCount(stats.totalVotes) },
  ];

  const open = stats.votingStatus === "open";

  return (
    <div>
      <dl className="grid grid-cols-2 gap-px border border-turf bg-turf lg:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-pitch px-4 py-5">
            <dt className="text-[0.75rem] leading-snug text-chalk-faint">{cell.label}</dt>
            <dd className="display tabular mt-2 text-3xl text-chalk">{cell.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border border-turf bg-pitch px-4 py-4">
        <div>
          <p className="text-[0.75rem] text-chalk-faint">Voting status</p>
          <div className="mt-2">
            <VotingStatusPill status={stats.votingStatus} />
          </div>
          <p className="mt-2 max-w-md text-[0.8125rem] leading-relaxed text-chalk-dim">
            {open
              ? "Public abhi vote kar sakti hai. Band karne par vote buttons disable ho jayenge aur har kshetra ki selected team decide hogi."
              : "Voting band hai. Public teams aur results dekh sakti hai, par naye vote submit nahi honge."}
          </p>
        </div>

        <form action={setVotingStatusAction}>
          <input type="hidden" name="status" value={open ? "closed" : "open"} />
          <Button type="submit" variant={open ? "danger" : "primary"} size="md">
            {open ? "Close voting" : "Open voting"}
          </Button>
        </form>
      </div>
    </div>
  );
}
