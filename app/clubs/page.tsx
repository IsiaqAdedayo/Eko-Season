import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { clubs } from "../../data/clubs";

export const metadata: Metadata = {
  title: "Lagos football clubs — Èkó Season",
  description:
    "The Lagos clubs in the NPFL, and the one that is not: colours, grounds, matchday and live fixtures.",
  alternates: { canonical: "/clubs" },
};

export default function ClubsPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-20 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/activities#football" className="transition hover:text-ink">
            ← Football you can watch
          </Link>
          <Link href="/activities" className="transition hover:text-ink">
            Things to do
          </Link>
        </nav>

        <header className="mt-10 border-b border-ink/10 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">Matchday</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            The Lagos clubs
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Three clubs in the top flight this season, all at Onikan, and one older club that is
            not. Each page has the story, the colours, and the fixtures read from the league&rsquo;s
            own table.
          </p>
        </header>

        <div className="mt-8 space-y-3">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-ink/10 bg-white/50 p-4 transition hover:border-ink/35"
            >
              <span className="flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-ink/10">
                {(club.colours ?? []).slice(0, 3).map((colour) => (
                  <span
                    key={colour.name}
                    className="flex-1"
                    style={{ backgroundColor: colour.hex }}
                    aria-hidden
                  />
                ))}
                {!club.colours ? (
                  <span className="flex flex-1 items-center justify-center text-[10px] text-muted">
                    ?
                  </span>
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-tight group-hover:text-ember">
                  {club.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted">
                  {club.nickname} · {club.league}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-ink/60">→</span>
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
