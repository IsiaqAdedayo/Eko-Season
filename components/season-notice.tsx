import { longDate, todayInLagos } from "../lib/schedule";
import { seasonWindow } from "../lib/season";
import { showEvents } from "../lib/shows";

/**
 * Says plainly when the calendar has nothing left on it.
 *
 * The old version counted down to a December season; this one only appears when
 * every listed night is in the past, so it works in any month of any year.
 * Otherwise it renders nothing.
 */
export function SeasonNotice({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const today = todayInLagos();
  const upcoming = showEvents.filter(
    (event) => (event.endDate ?? event.date) >= today,
  );
  if (upcoming.length > 0) return null;

  // Read at render, not at import: the notice outlives the month it appears in.
  const season = seasonWindow(showEvents, today);
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
        Nothing on the calendar yet
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          dark ? "text-cream/70" : "text-ink/75"
        }`}
      >
        {showEvents.length > 0
          ? `The last night on file was ${longDate(season.end)}. Everything below is the archive, with dates and prices as published at the time.`
          : "No dates have been announced yet."}{" "}
        New dates appear here as soon as venues publish them.
      </p>
    </div>
  );
}
