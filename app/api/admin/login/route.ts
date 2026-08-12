import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminToken, adminUser, safeEqual }
  from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// This endpoint is reachable without a session -- it has to be, it is how you get one -- so it
// is the one part of /admin exposed to the open internet. Throttle per IP: without it the
// password is subject to an unlimited online guessing attack, and it protects a list of
// delegates' phone numbers and medical needs.
//
// In-memory and per-process, which is enough here (one Node process behind nginx) and resets on
// restart. It is a brake on automated guessing, not a security boundary.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; until: number }>();

function throttled(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.until) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function record(ip: string, ok: boolean) {
  const now = Date.now();
  if (ok) { attempts.delete(ip); return; }
  const entry = attempts.get(ip);
  if (!entry || now > entry.until) attempts.set(ip, { count: 1, until: now + WINDOW_MS });
  else entry.count += 1;
}

export async function POST(request: Request) {
  const token = await adminToken();
  if (!token) {
    return Response.json({ error: "Admin access is not configured on this server." }, { status: 503 });
  }

  // nginx sets X-Real-IP and X-Forwarded-For (see the site's server block). Falling back to a
  // single shared bucket is deliberate: an unidentifiable client should be throttled with
  // everyone else, not exempted from throttling.
  const ip = request.headers.get("x-real-ip")
    || (request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "unknown";

  if (throttled(ip)) {
    return Response.json(
      { error: "Too many attempts. Wait 15 minutes and try again." }, { status: 429 });
  }

  let username = "";
  let password = "";
  try {
    const body = await request.json() as Record<string, unknown>;
    username = typeof body.username === "string" ? body.username : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const supplied = await (async () => {
    if (!password) return "";
    const data = new TextEncoder().encode(`wiagc-admin|${username || adminUser()}|${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  })();

  const ok = !!supplied && safeEqual(supplied, token);
  record(ip, ok);
  if (!ok) {
    // One message for a wrong username and a wrong password alike: naming which half was wrong
    // confirms a valid username to whoever is guessing.
    return Response.json({ error: "That username and password do not match." }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  const secure = (request.headers.get("x-forwarded-proto") || new URL(request.url).protocol)
    .startsWith("https");
  response.headers.append("set-cookie",
    `${ADMIN_COOKIE}=${token}; Path=/; Max-Age=${ADMIN_SESSION_SECONDS}; HttpOnly; SameSite=Lax`
    + (secure ? "; Secure" : ""));
  return response;
}
