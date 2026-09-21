import { SiteHeader } from "@/components/site-header";
import { LeaderboardSkeleton, Skeleton } from "@/components/skeleton";

export default function ResultsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <span className="sr-only" role="status">
          Standings load ho rahi hain
        </span>
        <Skeleton className="h-12 w-3/4 max-w-lg" />
        <Skeleton className="mt-4 h-4 w-2/3 max-w-md" />
        <Skeleton className="mt-8 h-16 w-full max-w-2xl" />
        <div className="mt-12">
          <LeaderboardSkeleton count={4} />
        </div>
      </main>
    </>
  );
}
