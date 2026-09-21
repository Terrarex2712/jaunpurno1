import { cn } from "@/lib/utils";

/** Loading placeholder. Pulses only where motion is allowed. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-turf/60 motion-reduce:animate-none", className)}
      aria-hidden="true"
    />
  );
}

/** Stand-in for a grid of team or constituency panels. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-turf bg-pitch p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <Skeleton className="h-16 w-16 shrink-0 rounded-[3px]" />
            <div className="flex-1 space-y-2.5 pt-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          <Skeleton className="mt-6 h-6 w-24" />
          <Skeleton className="mt-3 h-1.5 w-full" />
          <Skeleton className="mt-4 h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-turf bg-ink-raised">
          <div className="flex items-center justify-between border-b border-turf px-4 py-3.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="divide-y divide-turf">
            {Array.from({ length: 3 }, (_, row) => (
              <div key={row} className="flex items-center gap-3 px-4 py-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-9 w-9 shrink-0 rounded-[3px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
