import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { speakers } from "../../../../db/schema";

// Serves an uploaded speaker portrait out of the database.
//
// PUBLIC on purpose -- these appear on the public home page. It exposes nothing that is not
// already on that page, and it is the only way an uploaded image can be served at all: Next
// snapshots public/ at build time and 404s anything written there afterwards.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric)) return new Response("Not found", { status: 404 });

  const db = await getDb();
  const [row] = await db.select({ data: speakers.photoData, type: speakers.photoType })
    .from(speakers).where(eq(speakers.id, numeric)).limit(1);
  if (!row?.data) return new Response("Not found", { status: 404 });

  const bytes = row.data as Buffer;
  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": row.type || "application/octet-stream",
      "content-length": String(bytes.length),
      // Replacing a photo changes nothing about this URL, so it cannot be cached forever by the
      // browser -- a minute keeps the page fast while letting an edit show up promptly.
      "cache-control": "public, max-age=60",
    },
  });
}
