// The event's own details, in ONE place.
//
// The venue moved from Gallagher Convention Centre to the White Tent on 2026-08-12, and it was
// hardcoded in six files -- the hero, the confirmation card, the /verify page, the footer, the
// page metadata and the confirmation email. Six independent edits is how a site ends up sending
// delegates to the old address in an email while the website shows the new one.
export const EVENT = {
  dates: "16–19 September 2026",
  venue: "White Tent, Wakanda Village",
  location: "Sandton Market, next to Sandton City Mall",
  region: "Sandton, South Africa",
} as const;

/** "White Tent, Wakanda Village · Sandton Market, next to Sandton City Mall" */
export const VENUE_LINE = `${EVENT.venue} · ${EVENT.location}`;
