import { CheckCircle2, MapPin, Trophy, Users, Vote } from "lucide-react";
import { ScoreboardRail } from "@/components/brand-mark";

/**
 * A genuine four-stage sequence, so the steps carry numbers. Each card is a
 * panel rather than a rounded feature tile, with the numeral set on the
 * scoreboard grid.
 */
const STEPS = [
  {
    number: "01",
    icon: MapPin,
    title: "Apni Vidhan Sabha chunein",
    body: "Jaunpur ki 9 Vidhan Sabha mein se apna kshetra select karein.",
  },
  {
    number: "02",
    icon: Users,
    title: "Teams dekhein",
    body: "Us kshetra se jo cricket teams participate kar rahi hain, unhe dekhein.",
  },
  {
    number: "03",
    icon: Vote,
    title: "Apni team ko vote karein",
    body: "Apna naam aur mobile number daalein aur apna ek vote cast karein.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "No.1 team aage badhegi",
    body: "Har Vidhan Sabha se sabse zyada vote paane wali team selected team banegi.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
    >
      <ScoreboardRail className="mb-10" />

      <div className="max-w-2xl">
        <h2
          id="how-it-works-heading"
          className="display text-[clamp(2rem,7vw,3.25rem)] text-chalk"
        >
          Vote kaise karein
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-chalk-dim sm:text-base">
          Char aasaan step. Na koi account, na koi password — sirf naam aur
          mobile number.
        </p>
      </div>

      <ol className="mt-10 grid gap-px overflow-hidden border border-turf bg-turf sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.number} className="bg-pitch p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="display tabular text-2xl text-floodlight">
                {step.number}
              </span>
              <step.icon className="h-5 w-5 text-chalk-faint" aria-hidden />
            </div>
            <h3 className="display-tight mt-5 text-lg text-chalk">{step.title}</h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-chalk-dim">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-6 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-chalk-faint">
        <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-floodlight" aria-hidden />
        Ek mobile number se poore tournament mein sirf ek hi vote submit kiya ja
        sakta hai — chahe woh kisi bhi Vidhan Sabha ki team ho.
      </p>
    </section>
  );
}
