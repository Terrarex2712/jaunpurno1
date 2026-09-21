import { ImageIcon } from "lucide-react";
import { ScoreboardRail } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

/**
 * SPONSOR PRESENTATION — text only, on purpose.
 *
 * The brief names Suresh Raina as the tournament sponsor. Nothing here invents
 * a logo, signature, photograph, quote or endorsement statement, because none
 * were supplied. The media slot below is an empty placeholder sized for a real
 * asset.
 *
 * Before publishing: swap the placeholder for licensed artwork, and have the
 * sponsorship wording approved by whoever holds the rights. Do not ship
 * celebrity branding or attributed statements without that approval.
 */

const SPONSOR_NAME = "Suresh Raina";

export function SponsorBadge({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("inline-flex items-center gap-3 border-l-2 border-floodlight pl-4", className)}
      style={style}
    >
      <div>
        <p className="text-[0.75rem] text-chalk-faint">Proudly sponsored by</p>
        <p className="display-tight mt-1 text-lg text-chalk">{SPONSOR_NAME}</p>
      </div>
    </div>
  );
}

export function SponsorSection() {
  return (
    <section
      aria-labelledby="sponsor-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
    >
      <ScoreboardRail className="mb-10" />

      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-[0.8125rem] text-chalk-faint">Proudly sponsored by</p>
          <h2
            id="sponsor-heading"
            className="display mt-3 text-[clamp(2.5rem,9vw,4.5rem)] text-chalk"
          >
            {SPONSOR_NAME}
          </h2>
          <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-chalk-dim">
            Jaunpur No.1 ko support karne ke liye shukriya. Tournament ki
            sponsor branding aur official artwork announcement ke saath share ki
            jaayegi.
          </p>
        </div>

        {/*
          Placeholder media slot. Replace with the approved sponsor artwork
          (a real <Image />) once licensed assets are supplied.
        */}
        <div
          className="grid aspect-[4/3] w-full max-w-[16rem] place-items-center border border-dashed border-crease bg-pitch/60 p-6 text-center"
          role="img"
          aria-label="Sponsor artwork placeholder — awaiting approved assets"
        >
          <div>
            <ImageIcon className="mx-auto h-6 w-6 text-chalk-faint" aria-hidden />
            <p className="mt-3 text-[0.75rem] leading-relaxed text-chalk-faint">
              Sponsor artwork slot
              <br />
              (approved assets pending)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
