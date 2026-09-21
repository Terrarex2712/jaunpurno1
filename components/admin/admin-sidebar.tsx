"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, LogOut, Users } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { Wordmark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/teams", label: "Teams", icon: Users, exact: false },
  { href: "/admin/votes", label: "Votes", icon: BarChart3, exact: false },
] as const;

/**
 * Admin navigation: a horizontal rail on phones, a column from the large
 * breakpoint up.
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="border-b border-turf bg-ink-raised lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 lg:block lg:px-5 lg:py-5">
        <Link href="/" className="rounded-[2px]">
          <Wordmark />
        </Link>
        <p className="hidden text-[0.75rem] text-chalk-faint lg:mt-2 lg:block">
          Organiser console
        </p>

        <form action={logoutAction} className="lg:hidden">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[0.8125rem] font-medium text-chalk-dim hover:text-floodlight"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </form>
      </div>

      <nav aria-label="Admin" className="px-2 pb-2 lg:px-3 lg:pb-4">
        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="shrink-0 lg:shrink">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-[3px] px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-floodlight/12 text-floodlight"
                      : "text-chalk-dim hover:bg-pitch hover:text-chalk",
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={logoutAction} className="hidden px-3 lg:block">
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-2.5 rounded-[3px] px-3 text-sm font-medium text-chalk-dim transition-colors hover:bg-pitch hover:text-chalk"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Logout
        </button>
      </form>
    </div>
  );
}
