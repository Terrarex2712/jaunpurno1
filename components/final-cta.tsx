import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { VotingStatus } from "@/lib/domain/types";

/** Closing panel: the pitch returns one last time under the call to action. */
export function FinalCta({ votingStatus }: { votingStatus: VotingStatus }) {
  const open = votingStatus === "open";

  return (
    <section className="relative overflow-hidden border-y border-turf bg-ink-raised">
      <span className="beam beam-left opacity-70" aria-hidden="true" />
      <span className="pitch-floor" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <h2 className="display mx-auto max-w-3xl text-[clamp(2.25rem,8vw,4rem)] text-chalk">
          {open ? "Team taiyaar hai. Aapka vote taiyaar hai?" : "Voting band ho chuki hai"}
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
          {open
            ? "Har Vidhan Sabha ki participating teams public voting mein saamne hain. Sabse zyada valid votes paane wali team apne kshetra ki selected team banegi."
            : "Ab dekhiye har Vidhan Sabha se kaunsi team aage gayi. Standings live hain."}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {open ? (
            <>
              <Button asChild size="lg">
                <Link href="/vidhan-sabha">Vote Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/results">Standings dekhein</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg">
              <Link href="/results">Results dekhein</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
