"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Route-level error boundary. Says what to do, not what broke internally. */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error", error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-20 text-center">
      <div>
        <p className="display text-[clamp(3rem,14vw,6rem)] text-floodlight">Out</p>
        <h1 className="display-tight mt-4 text-2xl text-chalk">
          Kuch gadbad ho gayi
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-chalk-dim">
          Page load nahi ho paya. Dobara try karein — data safe hai.
        </p>
        <Button size="lg" className="mt-7" onClick={reset}>
          <RotateCw className="h-4 w-4" aria-hidden />
          Dobara try karein
        </Button>
      </div>
    </main>
  );
}
