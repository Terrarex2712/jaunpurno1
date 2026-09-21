import { Minus, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { TeamMonogram } from "@/components/team-monogram";
import type { TeamStanding } from "@/lib/domain/types";
import { cn, formatCount } from "@/lib/utils";

/**
 * How a top-of-table team is labelled. Derived from the constituency's
 * SelectionState, never from `rank === 1` alone — a tie must not silently
 * promote one team.
 */
export type LeaderMark = "leading" | "selected" | "tied" | "tie-pending";

const MARKS: Record<
  LeaderMark,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  leading: { label: "Leading", icon: TrendingUp },
  selected: { label: "Selected", icon: Trophy },
  tied: { label: "Tied", icon: Minus },
  "tie-pending": { label: "Tie — pending", icon: ShieldCheck },
};

/**
 * One broadcast-style standings row. The mark is an icon plus a word as well
 * as the amber bar, so the ranking reads without relying on colour.
 */
export function LeaderboardRow({
  standing,
  mark,
  className,
}: {
  standing: TeamStanding;
  mark?: LeaderMark;
  className?: string;
}) {
  const { team, votes, percentage, rank } = standing;
  const marked = mark ? MARKS[mark] : null;
  const MarkIcon = marked?.icon;

  return (
    <div
      className={cn(
        "border-l-2 bg-pitch px-4 py-3.5 sm:px-5",
        marked ? "border-l-floodlight" : "border-l-transparent",
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className={cn(
            "display tabular w-6 shrink-0 text-center text-base",
            marked ? "text-floodlight" : "text-chalk-faint",
          )}
        >
          {rank}
        </span>

        <TeamMonogram name={team.name} color={team.teamColor} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] font-semibold text-chalk">
            {team.name}
            {!team.active && (
              <span className="ml-2 align-middle text-[0.6875rem] font-normal text-chalk-faint">
                (inactive)
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-[0.75rem] text-chalk-faint">
            {team.locality ? `${team.locality} — ` : ""}
            {team.captainName}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="tabular text-[0.9375rem] font-semibold text-chalk">
            {formatCount(votes)}
          </p>
          <p className="tabular mt-0.5 text-[0.75rem] text-chalk-faint">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 pl-9 sm:pl-10">
        <ProgressBar percentage={percentage} tone={marked ? "lead" : "muted"} />
        {marked && MarkIcon && (
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-semibold text-floodlight">
            <MarkIcon className="h-3 w-3" aria-hidden />
            {marked.label}
          </span>
        )}
      </div>
    </div>
  );
}

/** Which teams carry a mark, given the constituency's resolved selection. */
export function leaderMarks(
  selection: import("@/lib/domain/types").SelectionState,
): Map<string, LeaderMark> {
  const marks = new Map<string, LeaderMark>();
  switch (selection.kind) {
    case "leading":
      marks.set(selection.team.id, "leading");
      break;
    case "selected":
      marks.set(selection.team.id, "selected");
      break;
    case "tie":
      for (const team of selection.teams) {
        marks.set(team.id, selection.votingOpen ? "tied" : "tie-pending");
      }
      break;
    case "none":
      break;
  }
  return marks;
}
