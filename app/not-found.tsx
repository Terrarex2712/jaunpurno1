import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-20 text-center">
        <div>
          <p className="display text-[clamp(3.5rem,16vw,7rem)] text-floodlight">404</p>
          <h1 className="display-tight mt-4 text-2xl text-chalk">
            Yeh page nahi mila
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-chalk-dim">
            Ho sakta hai link purana ho. Sabhi Vidhan Sabha yahan se dekhein.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/vidhan-sabha">Sabhi Vidhan Sabha</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
