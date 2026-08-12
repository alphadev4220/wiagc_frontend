import { asc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { speakers } from "../../../../db/schema";
import { readSpeakerForm } from "./form";

// Gated by middleware.ts (matcher /api/admin/:path*): no session, no access.
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const rows = await db.select({
    id: speakers.id, group: speakers.group, name: speakers.name, country: speakers.country,
    role: speakers.role, bio: speakers.bio, photoPath: speakers.photoPath,
    photoType: speakers.photoType, sortOrder: speakers.sortOrder,
  }).from(speakers).orderBy(asc(speakers.group), asc(speakers.sortOrder), asc(speakers.id));
  return Response.json({ speakers: rows });
}

export async function POST(request: Request) {
  const parsed = await readSpeakerForm(request);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: parsed.status });
  const { values, photo } = parsed;
  if (!values.name) return Response.json({ error: "A name is required." }, { status: 400 });

  const db = await getDb();
  const [row] = await db.insert(speakers).values({
    ...values,
    photoData: photo?.data ?? null,
    photoType: photo?.type ?? "",
  }).returning({ id: speakers.id });
  return Response.json({ ok: true, id: row.id }, { status: 201 });
}
