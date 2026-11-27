# Build-time snapshot: club pages on a once-failed feed

What happens when the NPFL site has not been reachable yet (or stops being
reachable) during `next build`, and the static page still has to ship.

## How the build visits each club

`app/clubs/[id]/page.tsx` is a Server Component. `generateStaticParams` lists the
four clubs, so `next build` renders `/clubs/sporting-lagos`, `/clubs/ikorodu-city`,
`/clubs/inter-lagos` and `/clubs/ikorodu-united` once each, in order.

The first pass for the earliest club evaluates `npflFixtures()`. That `fetch` hits
`https://npfl.com.ng/fixtures-results/` once, with:
- a 10-second `AbortSignal.timeout(10_000)`,
- a 30-minute `next: { revalidate: 1800 }`,
- the error path guarded so any throw short-cuits to `null`.

If the site is down, slow, returns a non-200, returns HTML with no usable table, or
throws — `npflFixtures()` returns `null`.

## What `null` becomes on the page

`app/clubs/[id]/page.tsx` does the following with a `null` feed:

1. `feed` is `null`, so `clubFixtures(feed, …)` is `null`.
2. The component falls back to the fixed shape — headings, badges, honours and the
   matchday note, with **no rows** and **no source line**.
3. Where the live page would print `no matches', a badge with `Played 0` and the
   league link appears instead of a scoreline, so the page is still real HTML.

The four static pages each ship with that shape: they contain the club copy and the
honours/ground/matchday block, and they contain neither a scoreline nor a
`Scraped from the NPFL` line. The page is complete HTML, not an error.

## What the build did on this run

A `next build` without even one successful feed visit produces four static HTML
pages for the clubs, plus the rest of the site that does not depend on the feed
(places, activities, market detail, search, tonight, weather, shows, sitemap).
There is no memory of the failed visit inside the emitted HTML except the absence
of the feed-specific block.

`npx tsc --noEmit` and `next build` both pass. The `/clubs` index and the
`/clubs/[id]` pages end up in the static list exactly as the other places pages do.

## The feed shape that the build is told to expect

`lib/fixtures.ts` exports `FixtureFeed`, with `fixtures`, `source`, `fetchedAt`.
`app/clubs/[id]/page.tsx` `await`s `npflFixtures()`, narrows it to
`ClubFixtures` and spreads the results into the page. If `npflFixtures()` is `null`,
that path is unreachable; the type of `clubFixtures(feed, …)` is `ClubFixtures`, so
the page's own branching never types `feed` as a thing it can call `results` on.

That is the property that matters at build time: nothing on the page inspects
`feed.fetchedAt` or `feed.source`, because those live in the dynamically-rendered
branch only. The static branch never sees them. If the feed is `null`, the
dynamically-rendered branch is skipped by the page, and the static content is the
same four blocks that the build renders for every club.
