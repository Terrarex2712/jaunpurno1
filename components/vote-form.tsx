"use client";

import { useId, useState, useTransition } from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { submitVote, type VoteActionResult } from "@/app/actions/vote";
import { Button } from "@/components/ui/button";
import { DISTRICT, STATE, type Team } from "@/lib/domain/types";
import { normalizePhone, normalizeVoterName } from "@/lib/services/phone";
import { cn } from "@/lib/utils";

type FieldErrors = { voterName?: string; phone?: string };

/**
 * The vote form.
 *
 * Client-side checks exist only so mistakes surface instantly — the server
 * re-runs every one of them, and the constituency is never sent from here.
 */
export function VoteForm({
  team,
  constituencyName,
  onResult,
}: {
  team: Team;
  constituencyName: string;
  onResult: (result: VoteActionResult) => void;
}) {
  const nameId = useId();
  const phoneId = useId();
  const [voterName, setVoterName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const errors: FieldErrors = {};
    if (!normalizeVoterName(voterName)) {
      errors.voterName = "Apna poora naam likhein (kam se kam 2 akshar).";
    }
    if (!normalizePhone(phone)) {
      errors.phone = "Valid 10 digit mobile number enter karein.";
    }

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    startTransition(async () => {
      const result = await submitVote({ voterName, phone, teamId: team.id });
      if (result.ok) {
        onResult(result);
        return;
      }
      if (result.code === "DUPLICATE_VOTE") {
        onResult(result);
        return;
      }
      if (result.field) {
        setFieldErrors({ [result.field]: result.message });
      } else {
        setFormError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5">
      <p className="text-[0.8125rem] leading-relaxed text-chalk-dim">
        Aap sirf ek team ko vote kar sakte hain. Vote submit hone ke baad change
        nahi hoga.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor={nameId} className="block text-[0.8125rem] font-semibold text-chalk">
            Naam
          </label>
          <input
            id={nameId}
            name="voterName"
            value={voterName}
            onChange={(event) => {
              setVoterName(event.target.value);
              if (fieldErrors.voterName) setFieldErrors((e) => ({ ...e, voterName: undefined }));
            }}
            autoComplete="name"
            enterKeyHint="next"
            maxLength={60}
            required
            aria-invalid={fieldErrors.voterName ? true : undefined}
            aria-describedby={fieldErrors.voterName ? `${nameId}-error` : undefined}
            placeholder="Aapka naam"
            className={cn(
              "mt-1.5 h-12 w-full rounded-[3px] border bg-ink px-3.5 text-[1rem] text-chalk placeholder:text-chalk-faint",
              fieldErrors.voterName ? "border-leather" : "border-crease",
            )}
          />
          {fieldErrors.voterName && (
            <p id={`${nameId}-error`} className="mt-1.5 text-[0.8125rem] text-leather-soft">
              {fieldErrors.voterName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={phoneId} className="block text-[0.8125rem] font-semibold text-chalk">
            Mobile number
          </label>
          <div
            className={cn(
              "mt-1.5 flex h-12 items-center rounded-[3px] border bg-ink",
              fieldErrors.phone ? "border-leather" : "border-crease",
            )}
          >
            <span
              className="tabular grid h-full place-items-center border-r border-crease px-3 text-[0.9375rem] text-chalk-dim"
              aria-hidden="true"
            >
              +91
            </span>
            <input
              id={phoneId}
              name="phone"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/[^\d+\s-]/g, "").slice(0, 18));
                if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: undefined }));
              }}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              enterKeyHint="done"
              required
              aria-invalid={fieldErrors.phone ? true : undefined}
              aria-describedby={
                fieldErrors.phone ? `${phoneId}-error ${phoneId}-hint` : `${phoneId}-hint`
              }
              placeholder="10 digit mobile number"
              className="tabular h-full min-w-0 flex-1 bg-transparent px-3.5 text-[1rem] text-chalk placeholder:text-chalk-faint placeholder:tracking-normal"
            />
          </div>
          <p id={`${phoneId}-hint`} className="mt-1.5 text-[0.75rem] text-chalk-faint">
            Ek mobile number se sirf ek vote submit kiya ja sakta hai.
          </p>
          {fieldErrors.phone && (
            <p id={`${phoneId}-error`} className="mt-1.5 text-[0.8125rem] text-leather-soft">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        {/* Locked context — the voter cannot move a vote to another area. */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-turf bg-turf">
          {[
            { label: "District", value: DISTRICT },
            { label: "State", value: STATE },
            { label: "Vidhan Sabha", value: constituencyName, span: true },
          ].map((row) => (
            <div
              key={row.label}
              className={cn("bg-pitch px-3.5 py-2.5", row.span && "col-span-2")}
            >
              <dt className="flex items-center gap-1.5 text-[0.75rem] text-chalk-faint">
                <Lock className="h-3 w-3" aria-hidden />
                {row.label}
              </dt>
              <dd className="mt-0.5 text-[0.9375rem] font-medium text-chalk">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-[3px] border border-leather/50 bg-leather/10 p-3 text-[0.8125rem] text-leather-soft"
        >
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
          {formError}
        </p>
      )}

      <div className="mt-6">
        <p className="text-[0.8125rem] text-chalk-dim">
          Vote ja raha hai{" "}
          <span className="font-semibold text-chalk">{team.name}</span> ko —{" "}
          {constituencyName}, {DISTRICT}.
        </p>
        <Button type="submit" size="lg" disabled={pending} className="mt-3 w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Vote submit ho raha hai...
            </>
          ) : (
            "Confirm Vote"
          )}
        </Button>
        <p className="mt-3 text-center text-[0.75rem] leading-relaxed text-chalk-faint">
          Vote submit karne ke baad badla nahi ja sakta. Mobile number abhi OTP
          se verify nahi hota.
        </p>
      </div>
    </form>
  );
}
