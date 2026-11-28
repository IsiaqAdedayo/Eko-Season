import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import {
  HOLIDAY_GUIDANCE,
  nextHoliday,
  upcomingHolidays,
} from "../../data/holidays";
import { longDate, todayInLagos } from "../../lib/schedule";
import { formatChecked } from "../../lib/site";
import { moviesFreshness, showsFreshness } from "../../lib/freshness";

// The page prints how old the feeds are, so it must not freeze at build time.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Practicalities — Èkó Season",
  description:
    "General guidance for Lagos: emergency numbers, when to look up a hospital, cash and cards, ride-hailing and the public holidays.",
  alternates: { canonical: "/practicalities" },
  openGraph: {
    type: "website",
    siteName: "Èkó Season",
    url: "/practicalities",
    title: "Lagos practicalities",
    description:
      "General guidance on emergencies, money, rides and public holidays — with the caveat that details change.",
  },
};

const EMERGENCY = [
  {
    label: "National emergency number",
    value: "112",
    note: "Nigeria's national emergency number. It is the number to try first for police, fire or an ambulance.",
  },
  {
    label: "Lagos State lines",
    value: "Ask locally",
    note: "The state publishes its own emergency contacts, and they have changed over the years. Check a current state government page, or ask your hotel to call on your behalf.",
  },
  {
    label: "Nearest police station",
    value: "Ask your hotel",
    note: "Divisional stations take reports in person. If a ride or a card is involved, ask for the report reference before you leave.",
  },
];

const MONEY = [
  "Cash is still the default for danfo, keke, street food and beach gates. Keep some small notes on you.",
  "Cards are usually accepted at hotels, malls, cinemas and sit-down restaurants. Ask before you order if you are relying on one.",
  "POS agents are common and charge a fee that varies by agent. Use one attached to a shop rather than a stranger on the street.",
  "ATMs can be empty around public holidays and busy weekends. Withdraw when you pass one during the day rather than assuming there will be cash later.",
  "Telling your bank you are travelling avoids a card being declined abroad without warning.",
];

const RIDES = [
  {
    name: "Uber and Bolt",
    note: "Both operate in Lagos and quote the fare in the app before you accept. Prices rise when demand is high, and by how much varies — the app figure is the one to judge.",
  },
  {
    name: "inDrive",
    note: "You propose a fare and drivers accept or counter-offer. Expect more back-and-forth than the fixed-price apps.",
  },
  {
    name: "LagRide",
    note: "An app-based service backed by the Lagos State government. Useful as an alternative when the international apps are surging.",
  },
  {
    name: "Keke and okada",
    note: "Short hops only. Agree the fare before you sit down. Okada are restricted on many highways and major roads, so check the route rather than assuming.",
  },
];

const SAFETY = [
  "Look at a bus before you get on it. If the inside or the crowd does not sit right with you, let it go and wait for the next one — you lose ten minutes, not your phone.",
  "Use the pedestrian bridges. The walk to the steps looks longer from the kerb than it is, and crossing a multi-lane road on foot is the actual risk you are weighing against it. Some corridors are also policed for jaywalking, which turns a shortcut into a fine.",
  "Carry bags in front of you on buses, in BRT queues, in market aisles and in kekes. A bag behind you is a bag someone else can open.",
  "Keep your phone out of sight in crowds. Bus stops, market entrances and packed forecourts are where a phone gets lifted, not at the venue itself.",
  "Before you get into an Uber or Bolt, check the plate number against the app — and the make and model of the car while you are at it. A matching plate on a different car is still the wrong car.",
  "Going a long way — island to mainland, or out along the Lekki-Epe corridor at night — share your live location with someone who is expecting you, and message them when you arrive.",
  "Ask what things cost before you agree to them, and ask more than one person. Market prices are not fixed, and a first figure is an opening offer.",
];

const section = "mt-14";
const heading = "font-display text-2xl";
const body = "mt-3 text-sm leading-relaxed text-ink/80";

export default function PracticalitiesPage() {
  const today = todayInLagos();
  const upcoming = nextHoliday(today);
  const holidayList = upcomingHolidays(today);

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-20 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/tonight" className="transition hover:text-ink">
            Tonight
          </Link>
        </nav>

        <header className="mt-10 border-b border-ink/10 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">
            Practicalities
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            The unglamorous half of a Lagos trip
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            General guidance for the things that are not on a listing: who to
            call, how money works, how people get home and what the public
            holidays mean.
          </p>

          <div className="mt-6 rounded-2xl border border-ink/15 bg-white/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ember">
              General guidance, not a verified directory
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              This page describes how things generally work in Lagos. It does
              not carry phone numbers, prices or opening hours for specific
              businesses — those change, and we cannot check them for you.
              Where a detail matters, confirm it with the venue, the hospital or
              the state government directly.
            </p>
          </div>
        </header>

        <section className={section}>
          <h2 className={heading}>Emergencies</h2>
          <dl className="mt-4 divide-y divide-ink/10">
            {EMERGENCY.map((item) => (
              <div key={item.label} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    {item.label}
                  </dt>
                  <dd
                    className={
                      item.value === "112"
                        ? "font-display text-2xl leading-none"
                        : "text-sm font-medium"
                    }
                  >
                    {item.value}
                  </dd>
                </div>
                <dd className="mt-1 text-sm leading-relaxed text-ink/80">
                  {item.note}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Emergency contact details are the kind of thing that should come
            from an official source on the day, not from a travel guide.
          </p>
        </section>

        <section className={section}>
          <h2 className={heading}>If you need a hospital</h2>
          <p className={body}>
            Rather than list hospitals whose details we cannot keep current,
            here is how to find one quickly:
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Ask your hotel or the venue you are at — most keep a preferred hospital and can call ahead for you.",
              "Search Maps for hospitals near where you are staying before you need one, and save the two closest.",
              "Private hospitals are concentrated on the Island and in Lekki; the mainland has the large public hospitals.",
              "For anything serious, call the emergency number first rather than trying to book a ride yourself.",
            ].map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm leading-relaxed text-ink/80"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            This is not medical advice. For malaria prevention, vaccinations or
            a prescription, speak to a doctor.
          </p>
        </section>

        <section className={section}>
          <h2 className={heading}>Cash, cards and POS</h2>
          <ul className="mt-4 space-y-3">
            {MONEY.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm leading-relaxed text-ink/80"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={section}>
          <h2 className={heading}>Getting home</h2>
          <div className="mt-4 space-y-4">
            {RIDES.map((ride) => (
              <div key={ride.name}>
                <p className="font-display text-lg leading-tight">{ride.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/75">
                  {ride.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Whichever app you use, share the trip with whoever is waiting for
            you and keep the plate number. If a driver asks you to cancel and
            pay cash, the trip stops being tracked — that is the point of the
            ask.
          </p>
        </section>

        <section className={section}>
          <h2 className={heading}>On the street</h2>
          <p className={body}>
            Nothing here is about a specific venue. It is the stuff Lagos
            teaches people in their first week, which is easier to read than to
            learn the hard way.
          </p>
          <ul className="mt-4 space-y-3">
            {SAFETY.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm leading-relaxed text-ink/80"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Written in our own words after a Lagos safety carousel by
            @aniksss19 on TikTok; no text or imagery is reproduced from it.
          </p>
        </section>

        <section className={section} id="holidays">
          <h2 className={heading}>Public holidays</h2>
          <p className={body}>
            {upcoming
              ? `Next up: ${upcoming.name} on ${longDate(upcoming.date)}.`
              : "No gazetted holidays in the next two years."}{" "}
            Fixed dates and Easter are calculated for any year, so this list keeps
            going past the current one; Eid dates are added when the federal
            government announces them.
          </p>
          {holidayList.length > 0 && (
            <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
            {holidayList.map((holiday) => (
              <li
                key={holiday.date}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
              >
                <span className="font-display text-lg leading-tight">
                  {holiday.name}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ember">
                  {longDate(holiday.date)}
                </span>
              </li>
              ))}
            </ul>
          )}
          <ul className="mt-5 space-y-3">
            {HOLIDAY_GUIDANCE.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm leading-relaxed text-ink/80"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Holiday dates are fixed by law; what any particular venue does on
            them is the venue&rsquo;s decision, not ours.
          </p>
        </section>

        <section className={section}>
          <h2 className={heading}>Health and weather</h2>
          <p className={body}>
            Lagos is hot and humid all year. The driest months, roughly November
            to February, bring harmattan haze on some mornings; the heavy rains
            arrive around April and last into October. Carry water, use sunscreen
            at the beach, and move long walks to the cooler parts of the day.
            Mosquitoes are present year-round, so repellent at dusk is worth
            packing.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <Link
              href="/weather"
              className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              Seven-day Lagos forecast
            </Link>{" "}
            ·{" "}
            <Link
              href="/tonight"
              className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              Tonight&rsquo;s plan
            </Link>
          </p>
        </section>

        <section className={section} id="refresh">
          <h2 className={heading}>How this guide is refreshed</h2>
          <p className={body}>
            Shows and film dates are scraped from the organisers&rsquo; own
            pages, then merged into the data files this site builds from. The
            scripts live in <code className="font-mono text-xs">scripts/</code>,
            and nothing is written unless a row passes a title-and-date sanity
            check.
          </p>
          <dl className="mt-4 divide-y divide-ink/10 text-sm">
            {[
              { label: "Show listings", when: showsFreshness() },
              { label: "Film release dates", when: moviesFreshness() },
            ].map(({ label, when }) => (
              <div key={label} className="flex justify-between gap-6 py-3">
                <dt className="text-muted">{label}</dt>
                <dd className={when.stale ? "text-ember" : ""}>
                  {formatChecked(when.iso.slice(0, 10))} ({when.label})
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-2xl bg-ink p-4 font-mono text-[11px] leading-relaxed text-cream/80">
            <p>npm run scrape:all &nbsp;# shows + films</p>
            <p>npm run check:data &nbsp;# validate every data file</p>
            <p>npm run check:parsers &nbsp;# fixture tests for the scrapers</p>
            <p>npm run check:routes &nbsp;# smoke-test a running server</p>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            A listing older than a week is flagged in the footer rather than
            quietly presented as current.
          </p>
        </section>

      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
