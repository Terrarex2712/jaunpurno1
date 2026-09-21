import { cn, monogram } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 text-[0.8125rem]",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
} as const;

/**
 * Stands in for a team badge until real crests are uploaded: two letters over
 * a seam curve, tinted with the team's own colour.
 */
export function TeamMonogram({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const accent = color ?? "#F5A524";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[3px] border font-display font-extrabold tracking-tight",
        SIZES[size],
        className,
      )}
      style={{
        borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} 12%, #0b1512)`,
        color: accent,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 h-full w-full opacity-30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-2 38C10 26 38 26 50 38"
          stroke={accent}
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
      <span className="relative">{monogram(name)}</span>
    </span>
  );
}
