"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Phone-only sticky call to action. It appears once the hero has scrolled away
 * and retires near the footer, and pages that use it reserve bottom padding so
 * it never sits on top of content.
 */
export function StickyVoteCta({ href = "/vidhan-sabha" }: { href?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY;
      const nearBottom =
        scrolled + window.innerHeight > document.documentElement.scrollHeight - 320;
      setVisible(scrolled > 560 && !nearBottom);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      hidden={!visible}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-turf bg-ink/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden"
    >
      <Button asChild size="lg" className="w-full">
        <Link href={href}>Vote for Your Team</Link>
      </Button>
    </div>
  );
}
