import { NextResponse, type NextRequest } from "next/server";

// GATE ON /admin.
//
// This is the only part of the site that serves delegates' personal data -- phone numbers, home
// countries, flight numbers, dietary and medical needs, emergency contacts. It runs in
// middleware rather than inside the page so the check happens before any handler touches the
// database, and so /api/admin/export is covered by the same rule as the page it belongs to.
// A check inside the React tree would leave the CSV endpoint open.

/** Compares without returning early on the first differing byte. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(request: NextRequest) {
  const user = process.env.WIAGC_ADMIN_USER || "admin";
  const password = process.env.WIAGC_ADMIN_PASSWORD || "";

  // FAIL CLOSED. A missing or empty password locks the page rather than opening it. The opposite
  // default -- "no password configured, so let everyone in" -- would publish the delegate list
  // the first time someone deployed without the env file.
  if (!password) {
    return new NextResponse("Admin access is not configured on this server.\n", {
      status: 503,
      headers: { "content-type": "text/plain", "cache-control": "no-store" },
    });
  }

  const supplied = request.headers.get("authorization") || "";
  if (safeEqual(supplied, `Basic ${btoa(`${user}:${password}`)}`)) {
    const response = NextResponse.next();
    // Personal data must not be stored by proxies or the browser's back/forward cache.
    response.headers.set("cache-control", "no-store, private");
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    return response;
  }

  return new NextResponse("Authentication required\n", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="WIAGC admin", charset="UTF-8"',
      "content-type": "text/plain",
      "cache-control": "no-store",
    },
  });
}

export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"] };
