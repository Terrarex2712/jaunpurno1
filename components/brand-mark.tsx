import { cn } from "@/lib/utils";

/**
 * Original brand mark: a wicket whose middle stump is drawn as the numeral 1,
 * with the curve of a cricket-ball seam sweeping behind it. Pure geometry —
 * no borrowed league or board iconography.
 */
export function JaunpurMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="2"
        className="stroke-floodlight"
        strokeWidth="1.5"
      />
      {/* Seam arc */}
      <path
        d="M3 24.5C8.5 20 23.5 20 29 24.5"
        className="stroke-chalk-faint"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray="2 2.5"
      />
      {/* Outer stumps */}
      <path
        d="M9.5 10.5v11M22.5 10.5v11"
        className="stroke-chalk"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Bail */}
      <path
        d="M8.5 9.75h15"
        className="stroke-chalk-faint"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Middle stump drawn as a 1 */}
      <path
        d="M13.75 10.75 16 8.5v13"
        className="stroke-floodlight"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <JaunpurMark className={cn("h-7 w-7 shrink-0", markClassName)} />
      <span className="display-tight whitespace-nowrap text-[0.9375rem] leading-none xs:text-[1.0625rem]">
        <span className="text-chalk">JAUNPUR</span>{" "}
        <span className="text-floodlight">NO.1</span>
      </span>
    </span>
  );
}

/**
 * Section separator: a ticked hairline broken by a single amber marker —
 * the rail that runs above a ground scoreboard.
 */
export function ScoreboardRail({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="scoreboard-rail flex-1" />
      <span className="h-1.5 w-1.5 shrink-0 bg-floodlight" />
      <span className="scoreboard-rail flex-1" />
    </div>
  );
}
