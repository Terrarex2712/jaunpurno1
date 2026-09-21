import { CircleDot, Lock, Minus, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import type { SelectionState, VotingStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const TONES = {
  lead: "border-floodlight/45 bg-floodlight/12 text-floodlight",
  done: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  warn: "border-leather/50 bg-leather/12 text-leather-soft",
  quiet: "border-turf bg-pitch text-chalk-dim",
} as const;

/**
 * Status is always carried by an icon and a word, never by colour alone —
 * so who is ahead stays readable without colour perception.
 */
export function StatusPill({
  tone = "quiet",
  icon: Icon,
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 text-[0.6875rem] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </span>
  );
}

export function VotingStatusPill({
  status,
  className,
}: {
  status: VotingStatus;
  className?: string;
}) {
  return status === "open" ? (
    <StatusPill tone="lead" icon={CircleDot} className={className}>
      Voting open
    </StatusPill>
  ) : (
    <StatusPill tone="warn" icon={Lock} className={className}>
      Voting closed
    </StatusPill>
  );
}

/** Renders whichever of the four selection outcomes a constituency is in. */
export function SelectionPill({
  selection,
  className,
}: {
  selection: SelectionState;
  className?: string;
}) {
  switch (selection.kind) {
    case "leading":
      return (
        <StatusPill tone="lead" icon={TrendingUp} className={className}>
          Currently leading
        </StatusPill>
      );
    case "selected":
      return (
        <StatusPill tone="done" icon={Trophy} className={className}>
          Selected team
        </StatusPill>
      );
    case "tie":
      return selection.votingOpen ? (
        <StatusPill tone="quiet" icon={Minus} className={className}>
          Tied at the top
        </StatusPill>
      ) : (
        <StatusPill tone="warn" icon={ShieldCheck} className={className}>
          Tie — selection pending
        </StatusPill>
      );
    case "none":
      return (
        <StatusPill tone="quiet" icon={Minus} className={className}>
          Abhi tak koi vote nahi
        </StatusPill>
      );
  }
}
