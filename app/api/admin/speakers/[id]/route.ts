import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { speakers } from "../../../../../db/schema";
import { readSpeakerForm } from "../form";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric)) return Response.json({ error: "Bad id." }, { status: 400 });

  const parsed = await readSpeakerForm(request);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: parsed.status });
  const { values, photo, clearPhoto } = parsed;
  if (!values.name) return Response.json({ error: "A name is required." }, { status: 400 });

  // A submit with no file part must LEAVE the existing photo alone -- the edit form cannot
  // repopulate a file input, so treating "no file" as "remove the photo" would wipe the portrait
  // every time someone fixed a typo in a bio.
  const patch: Record<string, unknown> = { ...values };
  if (photo) { patch.photoData = photo.data; patch.photoType = photo.type; }
  else if (clearPhoto) { patch.photoData = null; patch.photoType = ""; patch.photoPath = ""; }

  const db = await getDb();
  await db.update(speakers).set(patch).where(eq(speakers.id, numeric));
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric)) return Response.json({ error: "Bad id." }, { status: 400 });
  const db = await getDb();
  await db.delete(speakers).where(eq(speakers.id, numeric));
  return Response.json({ ok: true });
}
