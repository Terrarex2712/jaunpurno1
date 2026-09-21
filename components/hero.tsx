import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { SponsorBadge } from "@/components/sponsor-badge";
import { Button } from "@/components/ui/button";
import type { TournamentStats } from "@/lib/domain/types";
import { formatCount } from "@/lib/utils";

/** The four stages a team passes through, shown as the tournament route. */
const ROUTE = [
  { value: "9", label: "Vidhan Sabha", note: "Jaunpur district ke nau kshetra" },
  { value: "34", label: "Teams maidan mein", note: "Har kshetra se kai teams" },
  { value: "9", label: "Selected teams", note: "Sabse zyada vote paane wali" },
  { value: "1", label: "Grand tournament", note: "Jaunpur No.1 ka khitab" },
] as const;

export function Hero({ stats }: { stats: TournamentStats }) {
  const route = [
    ROUTE[0],
    { ...ROUTE[1], value: String(stats.activeTeamCount) },
    ROUTE[2],
    ROUTE[3],
  ];

  return (
    <section className="relative overflow-hidden border-b border-turf">
      <span className="beam beam-left" aria-hidden="true" />
      <span className="beam beam-right" aria-hidden="true" />
      <span className="pitch-floor" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
        <p
          className="rise flex items-center gap-2.5 text-[0.8125rem] font-medium text-chalk-dim"
          style={{ "--rise-delay": "0ms" } as React.CSSProperties}
        >
          <span className="h-2 w-2 bg-floodlight" aria-hidden="true" />
          Jaunpur ka community cricket tournament
        </p>

        <h1
          className="rise mt-5 flex flex-wrap items-end gap-x-5 gap-y-1"
          style={{ "--rise-delay": "70ms" } as React.CSSProperties}
        >
          <span className="display text-[clamp(2.5rem,11.5vw,7rem)] text-chalk">
            Jaunpur
          </span>
          <span className="display border border-floodlight/50 bg-floodlight/10 px-3 py-0.5 text-[clamp(1.875rem,7.5vw,4.25rem)] text-floodlight">
            No.1
          </span>
        </h1>

        <div className="scoreboard-rail mt-9" aria-hidden="true" />

        <div className="mt-9 grid items-start gap-11 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <p
              className="rise display-tight max-w-md text-[clamp(1.375rem,5vw,2rem)] text-chalk"
              style={{ "--rise-delay": "140ms" } as React.CSSProperties}
            >
              Jaunpur ka cricket. Jaunpur ki awaaz.
            </p>

            <p
              className="rise mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base"
              style={{ "--rise-delay": "180ms" } as React.CSSProperties}
            >
              Jaunpur ki 9 Vidhan Sabha se chunenge 9 zabardast cricket teams.
              Apni pasand ki team ko vote karein aur use tournament tak
              pahunchayein.
            </p>

            <div
              className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ "--rise-delay": "220ms" } as React.CSSProperties}
            >
              <Button asChild size="lg">
                <Link href="/vidhan-sabha">Apni Team Ko Vote Karein</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#vidhan-sabha">
                  <ArrowDown className="h-4 w-4" aria-hidden />
                  Teams Dekhein
                </Link>
              </Button>
            </div>

            <SponsorBadge
              className="rise mt-9"
              style={{ "--rise-delay": "280ms" } as React.CSSProperties}
            />
          </div>

          {/* Tournament route — a genuine four-stage sequence, so it is numbered. */}
          <div
            className="rise panel panel-lit relative p-5 sm:p-6"
            style={{ "--rise-delay": "320ms" } as React.CSSProperties}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="display-tight text-sm text-chalk">Tournament route</h2>
              <p className="tabular text-[0.8125rem] text-chalk-faint">
                {formatCount(stats.totalVotes)} votes ab tak
              </p>
            </div>

            <ol className="mt-5">
              {route.map((stage, index) => (
                <li key={stage.label} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < route.length - 1 && (
                    <span
                      className="absolute bottom-1 left-[1.375rem] top-11 w-px bg-crease"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className="display tabular relative grid h-11 w-11 shrink-0 place-items-center border border-crease bg-ink text-lg text-floodlight"
                    aria-hidden="true"
                  >
                    {stage.value}
                  </span>
                  <span className="min-w-0 pt-1">
                    <span className="block text-sm font-semibold text-chalk">
                      <span className="tabular">{stage.value}</span> {stage.label}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-chalk-faint">
                      {stage.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
