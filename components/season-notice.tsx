import { longDate, todayInLagos } from "../lib/schedule";
import { season, seasonState } from "../lib/season";

/**
 * Says plainly when the guide is ahead of, or behind, the calendar. Renders
 * nothing during the season, which is most of the year it is useful.
 */
export function SeasonNotice({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const state = seasonState(todayInLagos());
  if (state === "during") return null;

  const dark = tone === "dark";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        dark ? "border-cream/15 bg-cream/[0.04]" : "border-ink/15 bg-white/60"
      } ${className}`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.2em] ${
          dark ? "text-gold" : "text-ember"
        }`}
      >
        {state === "before" ? "Season not started" : "Season finished"}
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          dark ? "text-cream/70" : "text-ink/75"
        }`}
      >
        {state === "before"
          ? `The ${season.year} season opens on ${longDate(season.start)}. Everything listed is the announced programme, not a confirmed night out yet.`
          : `The ${season.year} season finished on ${longDate(season.end)}. This is the archive: dates and prices are as published at the time. New dates appear here as soon as venues announce them.`}
      </p>
    </div>
  );
}
