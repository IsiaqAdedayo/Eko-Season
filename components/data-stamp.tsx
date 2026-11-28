import Link from "next/link";
import { freshnessLine, showsFreshness, moviesFreshness } from "../lib/freshness";
import { REPORT_EMAIL } from "../lib/site";


/**
 * "Show listings checked 19 November 2026 · 5 days ago" plus a plain-language
 * note when a feed is getting old or has gone stale. The page never tells a
 * visitor to run a dev command; when a feed is that old the honest move is to
 * point at what the site has actually checked and where to report a problem.
 *
 * The page-level stale flag is 14 days, deliberately longer than the weekly
 * refresh cadence, so the line keeps saying "current for this week" through most
 * of the week instead of sounding alarmed on day eight. A loud stale banner is
 * what you see when the refresh has genuinely fallen behind.
 */
export function DataStamp({
  kind,
  tone = "light",
  className = "",
}: {
  kind: "shows" | "movies";
  tone?: "light" | "dark";
  className?: string;
}) {
  const when = kind === "shows" ? showsFreshness() : moviesFreshness();
  const label = kind === "shows" ? "Show listings" : "Film release dates";

  const muted = tone === "dark" ? "text-cream/50" : "text-muted";

  return (
    <p className={`text-[11px] leading-relaxed ${muted} ${className}`}>
      {label} checked {freshnessLine(when.iso)}.{" "}
      {when.stale ? (
        <>
          This listing is more than two weeks old.
          {kind === "movies"
            ? " The December film slate runs to 16 December 2026 — after that the page is showing the last confirmed release calendar, not a current one."
            : " If a show has been added or dropped since this was checked, the calendar may be incomplete."}
          {" "}<a
            href={`mailto:${REPORT_EMAIL}?subject=Èkó%20Season%3A%20${label}%20looks%20out%20of%20date`}
            className="underline decoration-current/30 underline-offset-4 hover:decoration-current"
          >
            Report a problem
          </a>
          {" "}or check the{
            " "}
            <Link
              href="/practicalities#refresh"
              className="underline decoration-current/30 underline-offset-4 hover:decoration-current"
            >
              source listed for this page
            </Link>
          {" "}before you travel.
        </>
      ) : when.days >= 7 ? (
        <>
          We refresh these listings weekly, so this is still within this week's
          update.
          {" "}<a
            href={`mailto:${REPORT_EMAIL}?subject=Èkó%20Season%3A%20${label}%20out%20of%20date`}
            className="underline decoration-current/30 underline-offset-4 hover:decoration-current"
            >
            Tell us if something has changed
          </a>
          .
        </>
      ) : (
        <Link
          href="/practicalities#refresh"
          className="underline decoration-current/30 underline-offset-4 hover:decoration-current"
        >
          How this is refreshed
        </Link>
      )}
    </p>
  );
}

