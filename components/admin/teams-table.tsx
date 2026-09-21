import Link from "next/link";
import { Pencil } from "lucide-react";
import { deleteTeamAction, toggleTeamActiveAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { TeamMonogram } from "@/components/team-monogram";
import { Button } from "@/components/ui/button";
import type { Constituency, Team } from "@/lib/domain/types";
import { cn, formatCount } from "@/lib/utils";

export type AdminTeamRow = {
  team: Team;
  votes: number;
  constituency: Constituency;
};

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 text-[0.6875rem] font-semibold leading-none",
        active
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-turf bg-ink text-chalk-faint",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-300" : "bg-chalk-faint")}
        aria-hidden="true"
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RowActions({ row }: { row: AdminTeamRow }) {
  const { team, votes } = row;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="subtle" size="sm">
        <Link href={`/admin/teams/${team.id}/edit`}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Link>
      </Button>

      <ConfirmButton
        action={toggleTeamActiveAction}
        hidden={{ id: team.id, active: String(!team.active) }}
        variant="subtle"
        label={team.active ? "Deactivate" : "Activate"}
        title={team.active ? `Deactivate ${team.name}?` : `Activate ${team.name}?`}
        description={
          team.active
            ? "Team ko naye votes milna band ho jayenge. Purane votes count mein bane rahenge."
            : "Team dobara public listing mein dikhegi aur votes accept karegi."
        }
        confirmLabel={team.active ? "Deactivate" : "Activate"}
      />

      {votes === 0 ? (
        <ConfirmButton
          action={deleteTeamAction}
          hidden={{ id: team.id }}
          label="Delete"
          title={`Delete ${team.name}?`}
          description="Is team ke paas koi vote nahi hai, isliye ise permanently delete kiya ja sakta hai. Yeh undo nahi hoga."
          confirmLabel="Delete team"
        />
      ) : (
        <span className="text-[0.75rem] text-chalk-faint">
          {formatCount(votes)} votes — deactivate only
        </span>
      )}
    </div>
  );
}

/** Cards on phones, a real table from the large breakpoint up. */
export function TeamsTable({ rows }: { rows: AdminTeamRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-crease bg-pitch/50 px-6 py-12 text-center">
        <p className="text-[0.9375rem] text-chalk">Abhi koi team nahi hai.</p>
        <p className="mt-2 text-[0.8125rem] text-chalk-dim">
          Pehli team add karein — woh turant public listing mein dikhegi.
        </p>
        <Button asChild size="md" className="mt-5">
          <Link href="/admin/teams/new">Add team</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <li key={row.team.id} className="border border-turf bg-pitch p-4">
            <div className="flex items-start gap-3">
              <TeamMonogram name={row.team.name} color={row.team.teamColor} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-semibold text-chalk">
                  {row.team.name}
                </p>
                <p className="mt-0.5 truncate text-[0.75rem] text-chalk-faint">
                  {row.constituency.name} — {row.team.captainName}
                </p>
              </div>
              <ActiveBadge active={row.team.active} />
            </div>
            <p className="tabular mt-3 text-[0.8125rem] text-chalk-dim">
              {formatCount(row.votes)} votes
            </p>
            <div className="mt-4">
              <RowActions row={row} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto border border-turf lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Teams with vote counts and controls</caption>
          <thead>
            <tr className="border-b border-turf bg-ink-raised">
              <th scope="col" className="px-4 py-3 text-[0.75rem] font-semibold text-chalk-faint">
                Team
              </th>
              <th scope="col" className="px-4 py-3 text-[0.75rem] font-semibold text-chalk-faint">
                Vidhan Sabha
              </th>
              <th scope="col" className="px-4 py-3 text-[0.75rem] font-semibold text-chalk-faint">
                Captain
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-[0.75rem] font-semibold text-chalk-faint"
              >
                Votes
              </th>
              <th scope="col" className="px-4 py-3 text-[0.75rem] font-semibold text-chalk-faint">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-[0.75rem] font-semibold text-chalk-faint">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-turf">
            {rows.map((row) => (
              <tr key={row.team.id} className="bg-pitch align-middle">
                <th scope="row" className="px-4 py-3 font-normal">
                  <span className="flex items-center gap-2.5">
                    <TeamMonogram name={row.team.name} color={row.team.teamColor} size="sm" />
                    <span className="text-[0.875rem] font-semibold text-chalk">
                      {row.team.name}
                    </span>
                  </span>
                </th>
                <td className="px-4 py-3 text-[0.8125rem] text-chalk-dim">
                  {row.constituency.name}
                </td>
                <td className="px-4 py-3 text-[0.8125rem] text-chalk-dim">
                  {row.team.captainName}
                </td>
                <td className="tabular px-4 py-3 text-right text-[0.875rem] font-semibold text-chalk">
                  {formatCount(row.votes)}
                </td>
                <td className="px-4 py-3">
                  <ActiveBadge active={row.team.active} />
                </td>
                <td className="px-4 py-3">
                  <RowActions row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
