"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vidhan-sabha", label: "Vidhan Sabha" },
  { href: "/results", label: "Results" },
  { href: "/how-it-works", label: "How It Works" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Navigating closes the sheet. Adjusting during render (rather than in an
  // effect) avoids a second render pass with the menu still open.
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // Stop the page behind the open sheet from scrolling.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-turf/80 bg-ink/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:rounded-[3px] focus:bg-floodlight focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[var(--header-height)] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-[2px] py-1"
          aria-label="Jaunpur No.1 — home"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[2px] px-3 text-sm font-medium transition-colors",
                isActive(pathname, link.href)
                  ? "text-floodlight"
                  : "text-chalk-dim hover:text-chalk",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="md" className="ml-3">
            <Link href="/vidhan-sabha">Vote Now</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button asChild size="md" className="px-4">
            <Link href="/vidhan-sabha">Vote Now</Link>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-[3px] border border-turf text-chalk"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="border-t border-turf bg-ink md:hidden"
      >
        <nav aria-label="Main" className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-turf/60 last:border-0">
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center text-[0.9375rem] font-medium",
                    isActive(pathname, link.href) ? "text-floodlight" : "text-chalk",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
