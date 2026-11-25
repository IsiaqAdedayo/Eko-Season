import { showsToIcs } from "../../../lib/ics";
import { showEvents, type ShowEvent } from "../../../lib/shows";
import { showIsPast } from "../../../lib/season";
import { todayInLagos } from "../../../lib/schedule";

/**
 * `GET /api/calendar` — every listed show.
 * `GET /api/calendar?shows=davido-oriade-the-residency,alo-once-upon-a-song`
 * — one calendar for a shared shortlist.
 *
 * Unknown ids are ignored rather than 404ing: a saved link should still give
 * you the shows it can resolve.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("shows") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const byId = new Map(showEvents.map((event) => [event.id, event]));
  const events: ShowEvent[] =
    requested.length > 0
      ? requested
          .map((id) => byId.get(id))
          .filter((event): event is ShowEvent => Boolean(event))
      : showEvents;

  // A calendar full of finished nights is worse than none: drop them.
  const today = todayInLagos();
  const upcoming = events.filter((event) => !showIsPast(event, today));

  if (upcoming.length === 0) {
    return new Response("No matching shows in the calendar.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = showsToIcs(
    upcoming,
    requested.length > 0
      ? "Èkó Season — my December list"
      : undefined,
  );

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="eko-season-shows.ics"',
      "cache-control": "public, max-age=3600",
    },
  });
}
