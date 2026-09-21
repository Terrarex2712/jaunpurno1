import Link from "next/link";
import { JaunpurMark } from "@/components/brand-mark";

const COUNTS = [
  { value: "9", label: "Vidhan Sabha" },
  { value: "9", label: "Selected teams" },
  { value: "1", label: "Grand tournament" },
] as const;

const LINKS = [
  { href: "/vidhan-sabha", label: "All Vidhan Sabha" },
  { href: "/results", label: "Live standings" },
  { href: "/how-it-works", label: "How voting works" },
  { href: "/admin", label: "Organiser login" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-turf bg-ink-raised">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <JaunpurMark className="h-9 w-9" />
              <p className="display text-2xl sm:text-3xl">
                <span className="text-chalk">Jaunpur</span>{" "}
                <span className="text-floodlight">No.1</span>
              </p>
            </div>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-chalk-dim">
              Jaunpur ka cricket, Jaunpur ki awaaz. Har Vidhan Sabha se ek team,
              chuni jaayegi aap logon ke vote se.
            </p>

            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
              {COUNTS.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <span className="display tabular block text-3xl text-floodlight">
                      {item.value}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] text-chalk-faint">
                      {item.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-8 xs:grid-cols-2">
            <nav aria-label="Footer">
              <h2 className="text-[0.8125rem] font-semibold text-chalk">Explore</h2>
              <ul className="mt-1">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-chalk-dim transition-colors hover:text-floodlight"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-[0.8125rem] font-semibold text-chalk">Maidan</h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-chalk-dim">
                Jaunpur
                <br />
                Uttar Pradesh
                <br />
                India
              </address>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-turf pt-6">
          <p className="max-w-3xl text-[0.8125rem] leading-relaxed text-chalk-faint">
            Jaunpur No.1 is a community cricket tournament platform and is not
            affiliated with government electoral voting. Teams, captains and
            localities shown here are demo data created for this prototype.
          </p>
          <p className="mt-4 text-[0.8125rem] text-chalk-faint">
            © {year} Jaunpur No.1
          </p>
        </div>
      </div>
    </footer>
  );
}
