"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VoteReceipt } from "@/lib/domain/types";

/**
 * Confirmation after a vote lands. It reports what was recorded and nothing
 * more — no claim that the number was verified, because it was not.
 */
export function VoteSuccess({
  receipt,
  onClose,
}: {
  receipt: VoteReceipt;
  onClose: () => void;
}) {
  return (
    <div className="pt-1 text-center">
      <span
        className="pop mx-auto grid h-14 w-14 place-items-center rounded-full border border-floodlight/50 bg-floodlight/15"
        aria-hidden="true"
      >
        <Check className="h-7 w-7 text-floodlight" />
      </span>

      <h2 className="display mt-5 text-3xl text-chalk">Vote ho gaya</h2>
      <p className="mt-2 text-[0.9375rem] text-chalk-dim">
        Aapka vote successfully submit ho chuka hai.
      </p>

      <div className="mt-6 border border-turf bg-pitch p-4">
        <p className="display-tight text-xl text-chalk">{receipt.teamName}</p>
        <p className="mt-1.5 text-[0.8125rem] text-chalk-faint">
          {receipt.constituencyName}, {receipt.district}, {receipt.state}
        </p>
      </div>

      <p className="mt-5 text-[0.9375rem] text-chalk-dim">
        Ab dekhte hain kaun banta hai Jaunpur No.1.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button asChild size="lg">
          <Link href="/results">View Current Results</Link>
        </Button>
        <Button variant="ghost" size="md" onClick={onClose}>
          Back to teams
        </Button>
      </div>
    </div>
  );
}
