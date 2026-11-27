import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/site-footer";
import { clubs, getClub } from "../../../data/clubs";
import {
  clubFixtures,
  fixtureDay,
  fixtureTime,
  npflFixtures,
  outcome,
  type Fixture,
} from "../../../lib/fixtures";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return clubs.map((club) => ({ id: club.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const club = getClub(id);
  if (!club) return { title: "Club not found — Èkó Season" };

  const url = `/clubs/${club.id}`;
  return {
    title: `${club.name} — fixtures, colours and matchday | Èkó Season`,
    description: `${club.summary} Founded ${club.founded}. Home games at ${club.ground}.`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: club.name,
      description: club.summary,
      url,
      siteName: "Èkó Season",
    },
  };
}

function scoreLine(fixture: Fixture, aliases: string[]) {
  if (!fixture.score) return null;
  const result = outcome(fixture, aliases);
  return {
    result,
    score: `${fixture.score.home}–${fixture.score.away}`,
  };
}

function FixtureRow({ fixture, aliases }: { fixture: Fixture; aliases: string[] }) {
  const line = scoreLine(fixture, aliases);
  const home = aliases.some((alias) => fixture.home.toLowerCase().includes(alias.toLowerCase()));
  const opponent = home ? fixture.away : fixture.home;
  const kickoff = fixtureTime(fixture);

  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 border-b border-ink/10 py-2.5 last:border-0">
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
        {fixtureDay(fixture.date)}
      </span>
      <span className="min-w-0 text-sm">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ember">
          {home ? "Home" : "Away"}
        </span>{" "}
        <span className="font-medium">{opponent}</span>
        {fixture.venue ? (
          <span className="block truncate text-[11px] text-muted">{fixture.venue}</span>
        ) : null}
      </span>
      <span className="whitespace-nowrap text-right text-sm">
        {line ? (
          <>
            <span className="tabular-nums text-ink/80">{line.score}</span>{" "}
            <span
              className={`ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                line.result === "W"
                  ? "bg-emerald-600/10 text-emerald-700"
                  : line.result === "D"
                    ? "bg-ink/10 text-ink/70"
                    : "bg-ember/10 text-ember"
              }`}
            >
              {line.result}
            </span>
          </>
        ) : (
          <span className="text-muted">{kickoff ?? "TBC"}</span>
        )}
      </span>
    </li>
  );
}

export default async function ClubPage({ params }: Props) {
  const { id } = await params;
  const club = getClub(id);
  if (!club) notFound();

  const feed = await npflFixtures();
  const fixtures = feed ? clubFixtures(feed, club.aliases) : null;
  const [primary, secondary] = [
    club.colours?.[0]?.hex ?? "#1c1a17",
    club.colours?.[1]?.hex ?? club.colours?.[0]?.hex ?? "#3a342c",
  ];

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-20 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/activities#football" className="transition hover:text-ink">
            ← Football you can watch
          </Link>
          <Link href="/clubs" className="transition hover:text-ink">
            All clubs
          </Link>
        </nav>

        <header
          className="mt-8 overflow-hidden rounded-3xl px-6 py-10 text-cream sm:px-10"
          style={{
            backgroundImage: `linear-gradient(rgba(12,10,8,0.35), rgba(12,10,8,0.35)), linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-cream/70">
            {club.league}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{club.name}</h1>
          <p className="mt-2 text-sm text-cream/80">
            {club.nickname} · founded {club.founded}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/90">{club.summary}</p>
        </header>

        <section className="mt-10">
          <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
            The club
          </h2>
          {club.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-4 text-sm leading-relaxed text-ink/80">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
            Colours
          </h2>
          {club.colours ? (
            <div className="mt-4 flex flex-wrap gap-4">
              {club.colours.map((colour) => (
                <div key={colour.name} className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-full border border-ink/15"
                    style={{ backgroundColor: colour.hex }}
                    aria-hidden
                  />
                  <span className="text-sm">
                    {colour.name}
                    <span className="block text-[11px] uppercase tracking-[0.1em] text-muted">
                      {colour.hex}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          {club.kitNote ? (
            <p className="mt-3 text-[11px] leading-relaxed text-muted">{club.kitNote}</p>
          ) : null}
        </section>

        <section className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
              Honours
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/80">
              {club.honours.map((honour) => (
                <li key={honour}>{honour}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
              Ground
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{club.ground}</p>
            <p className="mt-1 text-[11px] text-muted">
              Onikan is the only Lagos ground approved for NPFL fixtures this season, so all three
              top-flight clubs play here.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="border-b border-ink/20 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted">
            Matchday
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/80">
            {club.matchday.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-[11px]">
            {club.ticketsUrl ? (
              <a
                href={club.ticketsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                Tickets &amp; fixtures →
              </a>
            ) : null}
            {club.siteUrl && club.siteUrl !== club.ticketsUrl ? (
              <a
                href={club.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                Club website →
              </a>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-ink/20 pb-2">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted">Fixtures</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-ember">
              {fixtures ? `${fixtures.form.played} played` : "unavailable"}
            </span>
          </div>

          {club.fixtureNote ? (
            <p className="mt-4 rounded-xl border border-dashed border-ink/20 p-4 text-xs leading-relaxed text-muted">
              {club.fixtureNote}
            </p>
          ) : null}

          {!feed ? (
            <p className="mt-4 rounded-xl border border-dashed border-ink/20 p-4 text-xs leading-relaxed text-muted">
              Could not read the league&rsquo;s fixture table just now. The NPFL publishes it at{" "}
              <a
                href="https://npfl.com.ng/fixtures-results/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/30 underline-offset-4"
              >
                npfl.com.ng
              </a>
              .
            </p>
          ) : null}

          {fixtures && fixtures.results.length > 0 ? (
            <>
              <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-ember">
                Last {Math.min(5, fixtures.results.length)}
              </p>
              <ul className="mt-1">
                {fixtures.results.slice(0, 5).map((fixture) => (
                  <FixtureRow key={`${fixture.date}-${fixture.home}`} fixture={fixture} aliases={club.aliases} />
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-muted">
                {fixtures.form.won}W {fixtures.form.drawn}D {fixtures.form.lost}L ·{" "}
                {fixtures.form.goalsFor} scored, {fixtures.form.goalsAgainst} conceded across the
                matches on the league table.
              </p>
            </>
          ) : null}

          {fixtures && fixtures.upcoming.length > 0 ? (
            <>
              <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-ember">
                Next {Math.min(5, fixtures.upcoming.length)}
              </p>
              <ul className="mt-1">
                {fixtures.upcoming.slice(0, 5).map((fixture) => (
                  <FixtureRow key={`${fixture.date}-${fixture.home}`} fixture={fixture} aliases={club.aliases} />
                ))}
              </ul>
            </>
          ) : null}

          {feed ? (
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Scraped from the NPFL&rsquo;s own{" "}
              <a
                href={feed.source}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                fixtures &amp; results table
              </a>{" "}
              on {feed.fetchedAt}, and refreshed at most every 30 minutes. Kick-offs move; the club
              page is the final word.
            </p>
          ) : null}
        </section>

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/10 pt-6 text-[11px]">
          <Link
            href="/activities#football"
            className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            ← All Lagos football
          </Link>
          <Link
            href="/activities#campuses"
            className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            The campuses
          </Link>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
