/**
 * The artwork band for a card whose subject has no usable photograph: a show
 * from a festival that publishes no posters, a film whose distributor artwork
 * our sources cannot read.
 *
 * It is built from the date rather than the title — the card prints the title
 * right below — so a grid of them reads as a calendar instead of the same panel
 * repeated. The accent comes from the day of the month, which keeps neighbouring
 * cards different without any hashing.
 */

const ACCENTS = [
  "radial-gradient(130% 120% at 85% 0%, rgba(217,79,36,0.52) 0%, rgba(23,16,11,0) 62%)",
  "radial-gradient(130% 120% at 85% 0%, rgba(242,160,61,0.46) 0%, rgba(23,16,11,0) 62%)",
  "radial-gradient(130% 120% at 85% 0%, rgba(255,247,236,0.20) 0%, rgba(23,16,11,0) 62%)",
  "radial-gradient(120% 130% at 15% 0%, rgba(217,79,36,0.34) 0%, rgba(23,16,11,0) 64%)",
];

export function CardArtwork({
  date,
  left,
  right,
}: {
  date: string;
  /** Bottom-left label, e.g. "3 nights". */
  left: string;
  /** Bottom-right label, e.g. the area. */
  right?: string;
}) {
  const at = new Date(`${date}T12:00:00Z`);
  const day = Number(date.slice(8, 10));
  const month = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  })
    .format(at)
    .toUpperCase();
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(at)
    .toUpperCase();

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-ink text-cream"
      style={{ backgroundImage: ACCENTS[day % ACCENTS.length] }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none font-display text-[7rem] leading-none text-cream/[0.06]"
      >
        {day}
      </span>

      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-4xl leading-none">{day}</p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">
            {weekday} · {month}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-cream/50">
          <span>{left}</span>
          {right ? (
            <span className="max-w-[55%] truncate text-right">{right}</span>
          ) : null}
        </div>
      </div>

      <div
        className="perforation absolute inset-x-0 bottom-0 h-1.5 opacity-60"
        aria-hidden
      />
    </div>
  );
}
