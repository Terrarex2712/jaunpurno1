import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { TeamMonogram } from "@/components/team-monogram";
import { VoteDialog } from "@/components/vote-dialog";
import type { LeaderMark } from "@/components/leaderboard-row";
import type { TeamStanding } from "@/lib/domain/types";
import { formatCount } from "@/lib/utils";
import { Minus, ShieldCheck, TrendingUp, Trophy, UserRound } from "lucide-react";

const MARK_PILL = {
  leading: { tone: "lead", icon: TrendingUp, label: "Currently leading" },
  selected: { tone: "done", icon: Trophy, label: "Selected team" },
  tied: { tone: "quiet", icon: Minus, label: "Tied at the top" },
  "tie-pending": { tone: "warn", icon: ShieldCheck, label: "Tie — pending" },
} as const;

export function TeamCard({
  standing,
  constituencyName,
  votingOpen,
  mark,
}: {
  standing: TeamStanding;
  constituencyName: string;
  votingOpen: boolean;
  mark?: LeaderMark;
}) {
  const { team, votes, percentage } = standing;
  const pill = mark ? MARK_PILL[mark] : null;

  return (
    <article className="flex w-full flex-1 flex-col border border-turf bg-pitch p-4 transition-colors hover:border-crease sm:p-5">
      <div className="flex items-start gap-3.5">
        <TeamMonogram name={team.name} color={team.teamColor} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="display-tight text-[1.0625rem] text-chalk sm:text-lg">
            {team.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-chalk-dim">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-chalk-faint" aria-hidden />
            <span className="truncate">Captain: {team.captainName}</span>
          </p>
          {team.locality && (
            <p className="mt-1 truncate text-[0.8125rem] text-chalk-faint">
              {team.locality}
            </p>
          )}
        </div>
      </div>

      {team.shortDescription && (
        <p className="mt-4 text-[0.8125rem] leading-relaxed text-chalk-dim">
          {team.shortDescription}
        </p>
      )}

      <div className="mt-auto pt-5">
        {pill && (
          <StatusPill tone={pill.tone} icon={pill.icon} className="mb-3">
            {pill.label}
          </StatusPill>
        )}

        <div className="flex items-baseline justify-between gap-3">
          <p className="tabular display text-2xl text-chalk">
            {formatCount(votes)}{" "}
            <span className="text-[0.75rem] font-medium tracking-normal text-chalk-faint">
              votes
            </span>
          </p>
          <p className="tabular text-[0.8125rem] font-semibold text-chalk-dim">
            {percentage.toFixed(1)}%
          </p>
        </div>
        <ProgressBar
          percentage={percentage}
          tone={mark ? "lead" : "muted"}
          className="mt-2.5"
        />

        <div className="mt-4">
          <VoteDialog
            team={team}
            constituencyName={constituencyName}
            votingOpen={votingOpen}
          />
        </div>
      </div>
    </article>
  );
}
