import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found — Èkó Season",
  robots: { index: false, follow: true },
};

const LINKS = [
  ["/tonight", "Tonight"],
  ["/places", "Where to go"],
  ["/shows", "Shows"],
  ["/movies", "Movies"],
  ["/search", "Search"],
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-20 text-center text-ink">
      <p className="text-xs uppercase tracking-[0.3em] text-ember">404</p>
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
        That page isn&rsquo;t here
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        The link may be from an old share, or a venue may have moved. Start from
        one of these:
      </p>
      <nav className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
        {LINKS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-ink/15 px-4 py-2 transition hover:border-ink/40"
          >
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
