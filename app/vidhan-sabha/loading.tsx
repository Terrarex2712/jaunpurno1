import { SiteHeader } from "@/components/site-header";
import { CardGridSkeleton, Skeleton } from "@/components/skeleton";

export default function VidhanSabhaLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <span className="sr-only" role="status">
          Vidhan Sabha list load ho rahi hai
        </span>
        <Skeleton className="h-14 w-3/4 max-w-xl" />
        <Skeleton className="mt-5 h-4 w-2/3 max-w-lg" />
        <div className="mt-12">
          <CardGridSkeleton count={9} />
        </div>
      </main>
    </>
  );
}
