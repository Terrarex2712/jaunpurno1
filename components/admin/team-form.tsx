"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { saveTeamAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { Constituency, Team } from "@/lib/domain/types";

const FIELD =
  "mt-1.5 w-full rounded-[3px] border border-crease bg-ink px-3.5 py-2.5 text-[0.9375rem] text-chalk placeholder:text-chalk-faint";

/**
 * Create and edit share one form. Validation is re-run server-side in
 * `lib/services/teams.ts`, so `required` here is only a convenience.
 */
export function TeamForm({
  constituencies,
  team,
  defaultConstituencyId,
}: {
  constituencies: Constituency[];
  team?: Team;
  defaultConstituencyId?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveTeamAction,
    {},
  );
  const ids = {
    name: useId(),
    captain: useId(),
    constituency: useId(),
    locality: useId(),
    description: useId(),
    active: useId(),
  };

  return (
    <form action={formAction} className="max-w-xl">
      {team && <input type="hidden" name="id" value={team.id} />}

      {state.error && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-[3px] border border-leather/50 bg-leather/10 p-3 text-[0.8125rem] text-leather-soft"
        >
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor={ids.name} className="block text-[0.8125rem] font-semibold text-chalk">
            Team name <span className="text-floodlight">*</span>
          </label>
          <input
            id={ids.name}
            name="name"
            defaultValue={team?.name}
            required
            minLength={3}
            maxLength={60}
            placeholder="Badlapur Blasters"
            className={FIELD}
          />
        </div>

        <div>
          <label
            htmlFor={ids.captain}
            className="block text-[0.8125rem] font-semibold text-chalk"
          >
            Captain name <span className="text-floodlight">*</span>
          </label>
          <input
            id={ids.captain}
            name="captainName"
            defaultValue={team?.captainName}
            required
            minLength={3}
            maxLength={60}
            placeholder="Aman Yadav"
            className={FIELD}
          />
        </div>

        <div>
          <label
            htmlFor={ids.constituency}
            className="block text-[0.8125rem] font-semibold text-chalk"
          >
            Vidhan Sabha <span className="text-floodlight">*</span>
          </label>
          <select
            id={ids.constituency}
            name="constituencyId"
            defaultValue={team?.constituencyId ?? defaultConstituencyId ?? ""}
            required
            className={FIELD}
          >
            <option value="" disabled>
              Select Vidhan Sabha
            </option>
            {constituencies.map((constituency) => (
              <option key={constituency.id} value={constituency.id}>
                {constituency.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[0.75rem] text-chalk-faint">
            District Jaunpur aur state Uttar Pradesh fixed hain.
          </p>
        </div>

        <div>
          <label
            htmlFor={ids.locality}
            className="block text-[0.8125rem] font-semibold text-chalk"
          >
            Locality
          </label>
          <input
            id={ids.locality}
            name="locality"
            defaultValue={team?.locality ?? ""}
            maxLength={60}
            placeholder="Badlapur Bazaar"
            className={FIELD}
          />
        </div>

        <div>
          <label
            htmlFor={ids.description}
            className="block text-[0.8125rem] font-semibold text-chalk"
          >
            Short description
          </label>
          <textarea
            id={ids.description}
            name="shortDescription"
            defaultValue={team?.shortDescription ?? ""}
            maxLength={200}
            rows={3}
            placeholder="Team ke baare mein ek line."
            className={`${FIELD} resize-y`}
          />
        </div>

        <div className="flex items-start gap-3 border border-turf bg-pitch p-4">
          <input
            id={ids.active}
            name="active"
            type="checkbox"
            defaultChecked={team ? team.active : true}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#f5a524]"
          />
          <label htmlFor={ids.active} className="text-[0.875rem] text-chalk">
            Active
            <span className="mt-1 block text-[0.8125rem] text-chalk-dim">
              Sirf active teams public listing mein dikhti hain aur vote accept
              karti hain.
            </span>
          </label>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
        <Button asChild variant="subtle" size="lg">
          <Link href="/admin/teams">Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving...
            </>
          ) : team ? (
            "Save changes"
          ) : (
            "Add team"
          )}
        </Button>
      </div>
    </form>
  );
}
