import { cn } from "@/lib/utils";

/**
 * Vote share bar. Purely visual — the count and percentage are always printed
 * as text alongside, so the bar is hidden from assistive tech rather than
 * duplicating that information.
 */
export function ProgressBar({
  percentage,
  tone = "muted",
  className,
  animate = true,
}: {
  percentage: number;
  tone?: "lead" | "muted";
  className?: string;
  animate?: boolean;
}) {
  const width = Math.max(0, Math.min(100, percentage));
  return (
    <div
      aria-hidden="true"
      className={cn("h-1.5 w-full overflow-hidden bg-turf/70", className)}
    >
      <div
        className={cn(
          "h-full origin-left",
          animate && "bar-fill",
          tone === "lead" ? "bg-floodlight" : "bg-crease",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
