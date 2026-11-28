import Link from "next/link";
import { AREA_LINKS, NAV_LINKS } from "../lib/site";
import { DataStamp } from "./data-stamp";

export function SiteFooter() {
  return (
    <footer className="bg-ink px-6 py-16 text-cream sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 border-b border-cream/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-4xl leading-none sm:text-6xl">
              Èkó Season
            </p>
            <p className="mt-3 max-w-sm text-sm text-cream/60">
              A Lagos guide: where to go, who is playing, and how to get there
              without losing an hour to traffic.
            </p>
            <p className="mt-2 text-[11px] text-cream/45">
              Listings are rechecked weekly; each page carries its own check date.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-cream/70">
            {[...NAV_LINKS, ...AREA_LINKS].map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-cream">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-[11px] leading-relaxed text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p>
              Every entry carries its own check date. Doors close, prices move,
              and the season sells out — confirm before you pay.
            </p>
            <DataStamp kind="shows" tone="dark" />
            <DataStamp kind="movies" tone="dark" />
          </div>
          <p>
            Venue photography is used with permission; food photography is from
            Joyful Cook, also used with permission. Remaining images are
            illustrative and credited per photo — Unsplash and Wikimedia Commons.
          </p>
        </div>
      </div>
    </footer>
  );
}
