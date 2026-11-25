import Link from "next/link";
import { indoorPlaces, weatherContingency } from "../lib/contingency";
import type { TonightWeatherSignal } from "../lib/weather";

/**
 * The rain/heat fallback for the /tonight plan. It only appears when the
 * signal has something to say, so a clear week stays uncluttered.
 */
export function ContingencyPlan({ signal }: { signal: TonightWeatherSignal }) {
  const rows = weatherContingency(signal);
  if (rows.length === 0) return null;

  return (
    <section className="mt-10 rounded-3xl border border-ink/10 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl">If the weather turns</h2>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
          From the forecast, not a promise
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.cue} className="rounded-2xl bg-cream/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
              {row.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{row.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
          Covered options
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {indoorPlaces.map((place) => (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="inline-flex items-baseline gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-xs transition hover:border-ink/40"
            >
              {place.name}
              <span className="text-[10px] text-muted">{place.area}</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Suggestions are drawn from the guide&rsquo;s indoor categories. The
        forecast changes;{" "}
        <Link
          href="/weather"
          className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
        >
          check it
        </Link>{" "}
        before you leave.
      </p>
    </section>
  );
}
