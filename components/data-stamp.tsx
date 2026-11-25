import Link from "next/link";
import { freshnessLine, showsFreshness, moviesFreshness } from "../lib/freshness";

/**
 * "Show listings refreshed 19 November 2026 · 5 days ago" plus a louder line
 * once a feed is older than a week. A guide that cannot say when it was
 * checked is asking to be trusted on faith.
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
  const loud = tone === "dark" ? "text-gold" : "text-ember";

  return (
    <p className={`text-[11px] leading-relaxed ${muted} ${className}`}>
      {label} checked {freshnessLine(when.iso)}.{" "}
      {when.stale ? (
        <span className={loud}>
          That is over a week old — run{" "}
          <code className="font-mono">npm run scrape:all</code> or check the
          source before travelling.
        </span>
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
