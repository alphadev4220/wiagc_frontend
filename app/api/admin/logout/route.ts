import { ADMIN_COOKIE } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// POST, never GET: a GET logout can be triggered by any <img> tag on any other site, which is
// only an annoyance here but is the same shape of bug as a GET that deletes something.
export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append("set-cookie",
    `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return response;
}
