import { asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { speakers } from "../db/schema";
import type { Speaker } from "../lib/speakers";
import Cover from "./cover";
import RegistrationForm from "./registration-form";
import { PREVIEW_COOKIE, registrationOpen } from "../lib/gate";

// The form itself is a client component (four steps of local state) and cannot decide whether it
// is covered: an env check inside it would ship to the browser and be trivially edited away.
// This server component owns the decision and the form stays untouched underneath.
//
// The cover lives here rather than in layout.tsx on purpose -- /verify/[code] must keep working
// for delegates who already hold a confirmation code, and a layout-level cover would hide it too.
//
// It also loads the speaker line-up, which now lives in the database so /admin can edit it. The
// photo BYTES are deliberately not selected: they are megabytes each and are served separately
// by /api/speaker-photo/[id], so pulling them into this query would put every portrait into the
// HTML payload of every page load.
export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDb();
  const people = (await db.select({
    id: speakers.id, group: speakers.group, name: speakers.name, country: speakers.country,
    role: speakers.role, bio: speakers.bio, photoPath: speakers.photoPath,
    photoType: speakers.photoType, sortOrder: speakers.sortOrder,
  }).from(speakers).orderBy(asc(speakers.sortOrder), asc(speakers.id))) as Speaker[];

  const preview = (await cookies()).get(PREVIEW_COOKIE)?.value === "on";
  const covered = !registrationOpen() && !preview;
  return (
    <>
      <RegistrationForm speakers={people} />
      {covered && <Cover />}
    </>
  );
}
