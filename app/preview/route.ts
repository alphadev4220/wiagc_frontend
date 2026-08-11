import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE, previewKey } from "../../lib/gate";

// /preview?key=<WIAGC_PREVIEW_KEY>  -- drops the cover for this browser and unlocks
// /api/register, so the office can complete a real test registration while the public still sees
// the holding page. /preview?key=off puts the cover back.
function matches(supplied: string, expected: string) {
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const home = new URL("/", request.url);

  if (key === "off") {
    const response = NextResponse.redirect(home);
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }
  // 404 rather than 403: an unknown key should not confirm that a bypass exists.
  if (!matches(key, previewKey())) {
    return new NextResponse("Not found", { status: 404 });
  }

  const response = NextResponse.redirect(home);
  response.cookies.set(PREVIEW_COOKIE, "on", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: new URL(request.url).protocol === "https:",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
