import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/final-cta";
import { HowItWorks } from "@/components/how-it-works";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getRepositories } from "@/lib/db";
import { getTournamentStats } from "@/lib/services/results";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Jaunpur No.1 mein voting kaise hoti hai — Vidhan Sabha chunein, teams dekhein, aur ek mobile number se ek vote karein.",
};

const RULES = [
  {
    question: "Kitne vote kar sakte hain?",
    answer:
      "Ek mobile number se poore tournament mein sirf ek vote. Woh vote kisi bhi ek Vidhan Sabha ki kisi bhi ek team ko ja sakta hai — uske baad us number se dobara vote nahi hoga.",
  },
  {
    question: "Kya vote badla ja sakta hai?",
    answer:
      "Nahi. Vote submit hone ke baad usse change ya delete nahi kiya ja sakta, isliye confirm karne se pehle team dhyan se chunein.",
  },
  {
    question: "Selected team kaise decide hoti hai?",
    answer:
      "Voting band hone ke baad, har Vidhan Sabha mein sabse zyada valid votes paane wali team us kshetra ki selected team banti hai. Agar do ya zyada teams ke votes barabar reh gaye, selection pending rakha jaata hai.",
  },
  {
    question: "Kya mera number kisi ko dikhega?",
    answer:
      "Nahi. Public pages par kisi voter ka naam ya number nahi dikhta. Number sirf isliye liya jaata hai taaki ek number se ek hi vote ho.",
  },
  {
    question: "Kya yeh koi sarkari election hai?",
    answer:
      "Bilkul nahi. Jaunpur No.1 ek community cricket tournament platform hai. Iska government electoral voting se koi sambandh nahi hai.",
  },
] as const;

export default async function HowItWorksPage() {
  const stats = await getTournamentStats(getRepositories());

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden border-b border-turf">
          <span className="beam beam-right opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="display text-[clamp(2.25rem,9vw,4.5rem)] text-chalk">
              Voting kaise
              <span className="block text-floodlight">kaam karti hai</span>
            </h1>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
              Na account, na password, na email. Sirf naam aur mobile number —
              aur aapka vote 30 second mein submit.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/vidhan-sabha">Apni Team Ko Vote Karein</Link>
            </Button>
          </div>
        </section>

        <HowItWorks />

        <section
          aria-labelledby="rules-heading"
          className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20"
        >
          <h2 id="rules-heading" className="display text-[clamp(2rem,7vw,3.25rem)] text-chalk">
            Voting rules
          </h2>
          <dl className="mt-8 grid gap-px border border-turf bg-turf md:grid-cols-2">
            {RULES.map((rule) => (
              <div key={rule.question} className="bg-pitch p-5 sm:p-6">
                <dt className="display-tight text-[1.0625rem] text-chalk">
                  {rule.question}
                </dt>
                <dd className="mt-2.5 text-[0.875rem] leading-relaxed text-chalk-dim">
                  {rule.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <FinalCta votingStatus={stats.votingStatus} />
      </main>
      <SiteFooter />
    </>
  );
}
