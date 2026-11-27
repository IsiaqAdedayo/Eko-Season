import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { KIND_LABELS, searchAll, searchAllCount, SHOWING_LIMIT, type HitKind, type SearchHit } from "../../lib/search";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "Search — Èkó Season",
  description:
    "Search every Lagos place, thing to do, show, film and dish in the December guide.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search the Lagos December guide",
    description: "Places, things to do, shows, films and food — one search box.",
    url: "/search",
    type: "website",
    siteName: "Èkó Season",
  },
};

const ORDER: HitKind[] = ["place", "activity", "show", "movie", "eat"];

function group(hits: SearchHit[]) {
  return ORDER.map((kind) => ({
    kind,
    hits: hits.filter((hit) => hit.kind === kind),
  })).filter((entry) => entry.hits.length > 0);
}

function ResultRow({ hit }: { hit: SearchHit }) {
  return (
    <Link
      href={hit.href}
      className="group flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 transition hover:border-ink/30"
    >
      <span className="min-w-0">
        <span className="block font-display text-lg leading-tight group-hover:text-ember">
          {hit.title}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{hit.subtitle}</span>
      </span>
      {hit.meta && (
        <span className="shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-[10px] text-ink/70">
          {hit.meta}
        </span>
      )}
    </Link>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const hits = query
    ? searchAll(query, SHOWING_LIMIT, 0)
    : [];
  const total = query ? searchAllCount(query) : 0;
  const groups = group(hits);

  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-6 pt-8 sm:px-10">
        <nav className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            ← Èkó Season
          </Link>
          <Link href="/places" className="transition hover:text-ink">
            All places
          </Link>
        </nav>

        <header className="mt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">Search</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Find anything in the guide
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Venues, things to do, shows, films and plates. Try
            &ldquo;padel&rdquo;, &ldquo;Lekki beach&rdquo; or &ldquo;amala&rdquo;.
          </p>

          <form action="/search" method="get" className="mt-6 flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search the guide"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white/70 px-5 py-3 text-sm outline-none transition focus:border-ink/40"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
            >
              Search
            </button>
          </form>
        </header>

        {query.length === 0 && (
          <p className="mt-10 text-sm text-muted">
            Type something above. Nothing is tracked — the query stays in the
            URL.
          </p>
        )}

        {query.length > 0 && hits.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-ink/20 p-6">
            <p className="text-sm text-ink/75">
              Nothing matched &ldquo;{query}&rdquo;. Try a shorter word, the
              area (&ldquo;Ikeja&rdquo;), or browse{" "}
              <Link
                href="/places"
                className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                every place
              </Link>{" "}
              instead.
            </p>
          </div>
        )}

        {groups.map((entry) => (
          <section key={entry.kind} className="mt-10">
            <div className="flex items-baseline justify-between border-b border-ink/20 pb-1">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted">
                {KIND_LABELS[entry.kind]}
              </h2>
              <span className="text-[11px] text-muted">{entry.hits.length}</span>
            </div>
            {entry.hits.map((hit) => (
              <ResultRow key={`${hit.kind}-${hit.id}`} hit={hit} />
            ))}
          </section>
        ))}

        <p className="mt-12 text-[11px] leading-relaxed text-muted">
          {hits.length > 0
            ? `${hits.length} result${hits.length === 1 ? "" : "s"} for “${query}”.`
            : "Search covers the whole guide: place pages, the activities page, the show calendar, film releases and dishes."}
        </p>
      </div>

      <div className="mt-auto pt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
