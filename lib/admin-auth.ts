// Session for /admin, replacing the browser's built-in Basic-auth dialog.
//
// Basic auth put an unstyled browser prompt in the top-left of the window and gave no way to
// sign out short of closing the browser. This is a cookie session instead, so the office sees
// the conference's own login card and can log out.
//
// The cookie's value is a digest of the configured credential, so it is not guessable from the
// outside AND changing WIAGC_ADMIN_PASSWORD invalidates every existing session -- there is no
// separate session store to purge.
//
// Web Crypto rather than node:crypto: this runs in middleware as well as in route handlers, and
// middleware has no Node built-ins.
export const ADMIN_COOKIE = "wiagc_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

export function adminUser(): string {
  return process.env.WIAGC_ADMIN_USER || "admin";
}

/** "" when no password is configured -- callers must treat that as "locked", never as "open". */
export async function adminToken(): Promise<string> {
  const password = process.env.WIAGC_ADMIN_PASSWORD || "";
  if (!password) return "";
  const data = new TextEncoder().encode(`wiagc-admin|${adminUser()}|${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares without returning early on the first differing byte. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hasAdminSession(value: string | undefined): Promise<boolean> {
  const token = await adminToken();
  return !!token && !!value && safeEqual(value, token);
}
