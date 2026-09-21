import { ConstituencyCard } from "@/components/constituency-card";
import type { ConstituencyStandings } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function ConstituencyGrid({
  standings,
  className,
}: {
  standings: ConstituencyStandings[];
  className?: string;
}) {
  if (standings.length === 0) {
    return (
      <p className="border border-dashed border-crease bg-pitch/50 p-8 text-center text-sm text-chalk-dim">
        Vidhan Sabha list abhi load nahi ho payi. Page refresh karein.
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {standings.map((entry) => (
        <li key={entry.constituency.id} className="contents">
          <ConstituencyCard standings={entry} />
        </li>
      ))}
    </ul>
  );
}
