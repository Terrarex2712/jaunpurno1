"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useRef, useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { TeamMonogram } from "@/components/team-monogram";
import { Button } from "@/components/ui/button";
import { VoteForm } from "@/components/vote-form";
import { VoteSuccess } from "@/components/vote-success";
import type { VoteActionResult } from "@/app/actions/vote";
import type { Team, VoteReceipt } from "@/lib/domain/types";

type View =
  | { name: "form" }
  | { name: "success"; receipt: VoteReceipt }
  | { name: "duplicate"; message: string };

/**
 * Voting surface: a bottom sheet on phones and a centred dialog from the small
 * breakpoint up. Radix handles focus trapping, Escape and the scroll lock.
 */
export function VoteDialog({
  team,
  constituencyName,
  votingOpen,
}: {
  team: Team;
  constituencyName: string;
  votingOpen: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ name: "form" });
  const panelRef = useRef<HTMLDivElement>(null);

  const canVote = votingOpen && team.active;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // Reset only once the exit is done, so the panel does not flash back to the
    // form while closing.
    if (!next) window.setTimeout(() => setView({ name: "form" }), 180);
  }

  function handleResult(result: VoteActionResult) {
    if (result.ok) {
      setView({ name: "success", receipt: result.receipt });
    } else if (result.code === "DUPLICATE_VOTE") {
      setView({ name: "duplicate", message: result.message });
    }
  }

  if (!canVote) {
    return (
      <Button variant="subtle" size="md" disabled className="w-full">
        {votingOpen ? "Vote accept nahi ho rahe" : "Voting band ho chuki hai"}
      </Button>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button size="md" className="w-full">
          Vote for Team
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px]" />
        <Dialog.Content
          className="dialog-panel fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto overscroll-contain border-t border-crease bg-ink-raised px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[28rem] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[4px] sm:border sm:p-6"
          ref={panelRef}
          aria-describedby={undefined}
          // Land on the panel itself rather than the close button, so the
          // dialog is announced from its title and the first Tab reaches the
          // name field — without popping the phone keyboard open.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            panelRef.current?.focus();
          }}
        >
          {/* Sheet grabber, phones only. */}
          <span
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-crease sm:hidden"
            aria-hidden="true"
          />

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-[3px] text-chalk-faint hover:text-chalk"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </Dialog.Close>

          {view.name === "form" && (
            <>
              <div className="flex items-start gap-3 pr-10">
                <TeamMonogram name={team.name} color={team.teamColor} size="md" />
                <div className="min-w-0">
                  <Dialog.Title className="display-tight text-lg text-chalk">
                    Vote for {team.name}
                  </Dialog.Title>
                  <p className="mt-1 text-[0.8125rem] text-chalk-faint">
                    {constituencyName} — Captain: {team.captainName}
                  </p>
                </div>
              </div>
              <VoteForm
                team={team}
                constituencyName={constituencyName}
                onResult={handleResult}
              />
            </>
          )}

          {view.name === "duplicate" && (
            <div className="pt-1">
              <span
                className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-leather/50 bg-leather/12"
                aria-hidden="true"
              >
                <ShieldAlert className="h-7 w-7 text-leather-soft" />
              </span>
              <Dialog.Title className="display mt-5 text-center text-2xl text-chalk">
                Vote already submitted
              </Dialog.Title>
              <p role="alert" className="mt-3 text-center text-[0.9375rem] text-chalk-dim">
                {view.message}
              </p>
              <p className="mt-2 text-center text-[0.8125rem] text-chalk-faint">
                Ek mobile number se sirf ek team ko vote kiya ja sakta hai.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button asChild size="lg">
                  <Link href="/results">Results dekhein</Link>
                </Button>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="md">
                    Band karein
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          )}

          {view.name === "success" && (
            <>
              <Dialog.Title className="sr-only">Vote submitted</Dialog.Title>
              <VoteSuccess receipt={view.receipt} onClose={() => handleOpenChange(false)} />
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
