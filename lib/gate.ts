// Whether the public may register yet.
//
// Four registrations arrived before the conference office announced the site. The form is
// finished and stays deployed -- visitors still see it -- but it is covered by app/cover.tsx and
// /api/register refuses writes until this is switched on. Both read this one function, so the
// cover and the API can never disagree: a cover without the API guard would be decorative,
// since anyone can POST past an overlay.
//
// Default is CLOSED. An unset or misspelled variable must not silently open registration.
export const PREVIEW_COOKIE = "wiagc_preview";

export function registrationOpen(): boolean {
  return process.env.WIAGC_REGISTRATION_OPEN === "true";
}

// Lets the office use the real form while the public sees the cover: /preview?key=<this>
// sets the cookie below. Empty means no bypass exists at all, not "any key works".
export function previewKey(): string {
  return process.env.WIAGC_PREVIEW_KEY ?? "";
}
