import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, hasAdminSession } from "./lib/admin-auth";

// GATE ON THE ADMIN APIs.
//
// The /admin PAGE checks the session itself and renders the login card when there isn't one --
// that is what makes a centred login form possible at all, since middleware can only redirect
// or return a bare response, not render UI.
//
// The APIs cannot do that. /api/admin/export streams every delegate's contact details as a CSV,
// so it is checked here, before the handler runs. Login and logout are deliberately exempt:
// they are how a session is obtained and discarded, and gating them would lock everyone out.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  if (await hasAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    const response = NextResponse.next();
    // Personal data must not be stored by proxies or the browser's back/forward cache.
    response.headers.set("cache-control", "no-store, private");
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    return response;
  }

  return NextResponse.json({ error: "Sign in at /admin first." }, {
    status: 401,
    headers: { "cache-control": "no-store" },
  });
}

export const config = { matcher: ["/api/admin/:path*"] };
