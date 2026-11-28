import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import {
  ACTIVITIES_CHECKED,
  activities,
  footballClubs,
  markets,
  newcomerSteps,
  type Activity,
  type Market,
} from "../../data/activities";
import { schools, type School } from "../../data/schools";
import { imageUrl } from "../../lib/media";
import { getPlace, mapsSearch } from "../../lib/place";
import { formatChecked, SOCIAL_IMAGE } from "../../lib/site";

export const metadata: Metadata = {
  title: "Things to do in Lagos — Èkó Season",
  description:
    "Beyond the clubs: go-karting, archery, paint and sip, padel, five-a-side football, markets and the Lagos clubs you can watch any weekend.",
  alternates: { canonical: "/activities" },
  openGraph: {
    title: "Things to do in Lagos",
    description:
      "Activities, sports, markets and matchdays for a Lagos weekend.",
    url: "/activities",
    type: "website",
    siteName: "Èkó Season",
    images: [
      {
        url: imageUrl(
          getPlace("lekki-conservation-centre")?.gallery[0] ?? SOCIAL_IMAGE,
          1200,
          630,
        ),
        width: 1200,
        height: 630,
        alt: "Things to do in Lagos",
      },
    ],
  },
};

/** The activity list, grouped by what you are actually booking. */
const ACTIVITY_GROUPS = [
  {
    id: "games",
    label: "Games, targets and craft",
    blurb:
      "Sessions you book by the hour or the day: karts, paintball, bows, axes, a game bar, a paintbrush and a potter's wheel. Mostly under cover, which is what a rainy Lagos afternoon needs.",
    ids: [
      "karting",
      "paintball",
      "archery",
      "axe-throwing",
      "arcade-and-bowling",
      "paint-and-sip",
      "pottery",
    ],
  },
  {
    id: "sports",
    label: "Sport, from the pitch to the pool",
    blurb:
      "Floodlit five-a-side, padel and tennis courts, basketball, table tennis, open sparring, three golf courses and two public pools — the sport you play rather than watch, booked by the hour or the round.",
    ids: [
      "five-a-side",
      "basketball",
      "padel",
      "tennis",
      "table-tennis",
      "sparring",
      "golf",
      "swimming",
      "water-park",
    ],
  },
  {
    id: "slow-days",
    label: "Slow days",
    blurb:
      "Not a night out: a spa morning, a hammam, a Pilates class and a set of nails in the same building. The right answer to the day after a late Lagos night, when the beach is too far and the traffic is too much.",
    ids: ["spa-day"],
  },
];

const activityGroups = ACTIVITY_GROUPS.map((group) => ({
  ...group,
  items: group.ids
    .map((id) => activities.find((activity) => activity.id === id))
    .filter((activity): activity is Activity => activity !== undefined),
}));

const section = "mt-16 scroll-mt-24";
const heading = "font-display text-2xl sm:text-3xl";
const body = "mt-3 text-sm leading-relaxed text-ink/80";

/** The disclosure under an illustrative photograph. */
function ImageNote({ note }: { note: string }) {
  return (
    <p className="mt-2 border-l-2 border-ember/40 pl-2 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ember/80">
      {note}
    </p>
  );
}

/** A photograph's credit line, rendered as a caption link back to the source. */
function Credit({ credit, page }: { credit: string; page: string }) {
  return (
    <figcaption className="mt-2 text-[10px] leading-relaxed text-muted">
      Photo:{" "}
      <a
        href={page}
        target="_blank"
        rel="noreferrer"
        className="underline decoration-ink/20 underline-offset-2 hover:decoration-ink/50"
      >
        {credit}
      </a>
    </figcaption>
  );
}

function ActivityBlock({ activity }: { activity: Activity }) {
  return (
    <article
      id={activity.id}
      className="grid scroll-mt-24 gap-6 border-b border-ink/10 py-10 sm:grid-cols-[15rem_1fr] lg:grid-cols-[19rem_1fr]"
    >
      <figure className="m-0">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={imageUrl(activity.image, 900)}
            alt={activity.imageAlt}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover sm:aspect-[4/5]"
          />
          {activity.price ? (
            <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-medium text-ink">
              {activity.price}
            </span>
          ) : null}
        </div>
        {activity.imageNote ? <ImageNote note={activity.imageNote} /> : null}
        <Credit credit={activity.imageCredit} page={activity.imagePage} />
      </figure>

      <div>
        <h3 className="font-display text-2xl leading-tight">{activity.title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/80">
          {activity.blurb}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-ember">
          Best for: {activity.bestFor}
        </p>

        {activity.venues.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {activity.venues.map((venue) => (
              <li
                key={venue.name}
                className="rounded-xl border border-ink/10 bg-white/50 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-medium">{venue.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    {venue.area}
                  </p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {venue.note}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[11px]">
                  {venue.price ? (
                    <span className="text-ink/70">{venue.price}</span>
                  ) : null}
                  <a
                    href={mapsSearch(
                      venue.address ?? `${venue.name}, ${venue.area}, Lagos`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                  >
                    Directions
                  </a>
                  {venue.url ? (
                    <a
                      href={venue.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-ink/20 p-4 text-xs leading-relaxed text-muted">
            {activity.note}
          </p>
        )}
      </div>
    </article>
  );
}

function MarketCard({ market }: { market: Market }) {
  return (
    <article
      id={market.id}
      className="flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/50"
    >
      <img
        src={imageUrl(market.image, 720)}
        alt={market.imageAlt}
        loading="lazy"
        decoding="async"
        className="aspect-[3/2] w-full object-cover"
      />
      {market.imageNote ? (
        <div className="mt-2 px-4">
          <ImageNote note={market.imageNote} />
        </div>
      ) : null}
      <Credit credit={market.imageCredit} page={market.imagePage} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <Link
            href={`/markets/${market.id}`}
            className="font-display text-lg leading-tight underline decoration-ink/15 underline-offset-4 transition hover:decoration-ink"
          >
            {market.name}
          </Link>
          <p className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted">
            {market.area}
          </p>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ember">
          {market.knownFor}
        </p>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
          {market.note}
        </p>
        <p className="mt-3 text-[11px] text-ink/70">{market.bestTime}</p>
        <div className="mt-2 flex flex-col gap-1.5 text-[11px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <Link
              href={`/markets/${market.id}`}
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              What to buy
            </Link>
            <a
              href={mapsSearch(`${market.name}, ${market.area}, Lagos`)}
              target="_blank"
              rel="noreferrer"
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              Directions
            </a>
          </span>
        </div>
      </div>
    </article>
  );
}

function SchoolCard({ school }: { school: School }) {
  return (
    <article
      id={school.id}
      className="flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/50"
    >
      <img
        src={imageUrl(school.image, 900)}
        alt={school.imageAlt}
        loading="lazy"
        decoding="async"
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg leading-tight">{school.name}</h3>
          <p className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted">
            {school.founded}
          </p>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ember">
          {school.area}
        </p>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
          {school.note}
        </p>
        <div className="mt-3 flex flex-col gap-1.5 text-[11px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <a
              href={mapsSearch(school.address)}
              target="_blank"
              rel="noreferrer"
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              Directions
            </a>
            {school.url ? (
              <a
                href={school.url}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                Website
              </a>
            ) : null}
          </span>
          <span className="shrink-0 text-[9px] text-muted">
            <a
              href={school.imagePage}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-ink/15 underline-offset-2 hover:decoration-ink/40"
            >
              {school.imageCredit}
            </a>
          </span>
        </div>
      </div>
    </article>
  );
}

/** Four places that keep turning up in other people's Reels. */
const VIRAL = [
  {
    id: "lekki-conservation-centre",
    line: "The canopy walk. Go at opening — the walkway is narrow and everyone wants the same photo.",
  },
  {
    id: "nike-art-gallery",
    line: "Four floors of Nigerian art and the rainbow staircase everyone poses on.",
  },
  {
    id: "lekki-ikoyi-link-bridge",
    line: "The cable-stayed bridge over the lagoon — shot from the Ikoyi side at dusk.",
  },
  {
    id: "freedom-park",
    line: "The old colonial prison turned open-air park — best on a Sunday afternoon.",
  },
];

export default function ActivitiesPage() {
  const viral = VIRAL.map((item) => ({
    ...item,
    place: getPlace(item.id),
  })).filter((item) => item.place);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-4xl px-6 pt-8 pb-20 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/places" className="transition hover:text-ink">
            All places
          </Link>
        </nav>

        <header className="mt-10 border-b border-ink/10 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">
            Things to do
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            More than a night out
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Lagos is not only clubs and concerts. There is a kart
            track out past Lekki, three archery ranges, four padel clubs, a
            top-flight football league that has come home, and markets that will
            sell you a whole new wardrobe before lunch.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
            {[
              { href: "#games", label: "Games & targets" },
              { href: "#sports", label: "Sports" },
              { href: "#campuses", label: "Campuses" },
              { href: "#football", label: "Football" },
              { href: "#markets", label: "Markets" },
              { href: "#first-week", label: "First week" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full border border-ink/15 px-3 py-1.5 transition hover:border-ink/40"
              >
                {link.label}
              </a>
            ))}
          </div>
        </header>

        <section id="activities" className={section}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
            <h2 className={heading}>Pick something to do</h2>
            <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ember">
              {activities.length} activities
            </p>
          </div>
          <p className={body}>
            Booked by the hour or the session. Most of it is indoors or under
            cover; the golf, the tennis, the pools and the water parks are the
            exceptions, so plan those for a morning.
          </p>

          {activityGroups.map((group) => (
            <div key={group.id} id={group.id} className="mt-10 scroll-mt-24">
              <div className="flex flex-col gap-1 border-b border-ink/10 pb-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-display text-xl">{group.label}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                  {group.items.length} activities
                </p>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {group.blurb}
              </p>

              <div>
                {group.items.map((activity) => (
                  <ActivityBlock key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section id="campuses" className={section}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
            <h2 className={heading}>The campuses</h2>
            <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ember">
              {schools.length} schools
            </p>
          </div>
          <p className={body}>
            From the country&rsquo;s first technical institute in Yaba to a
            university wrapped around 802 acres of lagoon at Akoka, and out
            along the Badagry expressway to Ojo and Ijanikin. These are working
            campuses, not sights: go with someone who studies there, keep clear
            of lecture halls, and eat in the canteen — it is priced for
            students.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        </section>

        <section id="football" className={section}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
            <h2 className={heading}>Football you can watch</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ember">
              NPFL 2026/27
            </p>
          </div>
          <p className={body}>
            Lagos has three top-flight clubs this season and all three play at
            the same ground, Mobolaji Johnson Arena in Onikan. That means a
            match most weekends, a short ride from Victoria Island, and a ticket
            that costs less than a cocktail.
          </p>

          <div className="mt-4">
            {footballClubs.map((club) => (
              <div
                key={club.name}
                className="flex flex-col gap-3 border-b border-ink/10 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <div className="max-w-xl">
                  <Link
                    href={`/clubs/${club.id}`}
                    className="font-display text-xl leading-tight underline decoration-ink/15 underline-offset-4 transition hover:decoration-ink"
                  >
                    {club.name}
                  </Link>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ember">
                    {club.league} · {club.ground}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/80">
                    {club.note}
                  </p>
                </div>
                {club.url ? (
                  <a
                    href={club.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[11px] text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                  >
                    Fixtures &amp; tickets →
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-ink/15 bg-white/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-ember">
              Watching in comfort
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              Onikan is open-air with a covered main stand. Buy a seat rather
              than a terrace ticket, arrive an hour before kick-off, and take
              your own water — concession queues at Nigerian grounds are not
              built for a crowd arriving at 3:55pm. Kick-off times shift for
              television, so confirm on the club&rsquo;s page the day before.
            </p>
          </div>
        </section>

        <section id="markets" className={section}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
            <h2 className={heading}>The markets worth the trip</h2>
            <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ember">
              {markets.length} markets
            </p>
          </div>
          <p className={body}>
            Lagos shopping is not a browse. Know what each market is for, go at
            the right hour, and take cash in small notes. Prices are a starting
            point — haggling is expected, and walking away is part of it.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </section>

        <section id="first-week" className={section}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
            <h2 className={heading}>Your first week in town</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ember">
              In this order
            </p>
          </div>
          <p className={body}>
            The errands that make everything else in the guide usable — a line
            that works, cash that is small enough to spend, and one game already
            in the diary.
          </p>

          <ol className="mt-6 space-y-4">
            {newcomerSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-cream">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {step.note}
                  </p>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="mt-1 inline-block text-[11px] text-ember underline decoration-ember/30 underline-offset-4 hover:decoration-ember"
                    >
                      {step.hrefLabel ?? "More"} →
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {viral.length > 0 ? (
          <section className="mt-16">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/10 pb-2">
              <h2 className={heading}>The clips you have already seen</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ember">
                Lagos, on camera
              </p>
            </div>
            <p className={body}>
              If a Lagos spot keeps turning up in your feed, it is probably one
              of these four. They are all in the guide, with the practical bits
              — entry, timing, how to get there — on their own pages.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {viral.map((item) => (
                <Link
                  key={item.id}
                  href={`/places/${item.id}`}
                  className="group flex gap-4 rounded-2xl border border-ink/10 bg-white/50 p-3 transition hover:border-ink/30"
                >
                  <img
                    src={imageUrl(item.place!.gallery[0], 400)}
                    alt={item.place!.name}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-base leading-tight">
                      {item.place!.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {item.line}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-12 text-[11px] leading-relaxed text-muted">
          Venues, hours and prices were read on {formatChecked(ACTIVITIES_CHECKED)}
          . Lagos moves things: call before a long trip across town, and check
          a club&rsquo;s own page for kick-off times.
        </p>
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
