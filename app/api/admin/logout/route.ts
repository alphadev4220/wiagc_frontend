import { ADMIN_COOKIE } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// POST, never GET: a GET logout can be triggered by any <img> tag on any other site, which is
// only an annoyance here but is the same shape of bug as a GET that deletes something.
//
// Answers with a redirect rather than JSON so a plain <form method="post"> works -- that keeps
// the sign-out button inside a server component instead of forcing the whole header to ship as
// client-side JavaScript.
export async function POST(request: Request) {
  const response = new Response(null, {
    status: 303,
    headers: { location: new URL("/admin", request.url).toString() },
  });
  response.headers.append("set-cookie",
    `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return response;
}
