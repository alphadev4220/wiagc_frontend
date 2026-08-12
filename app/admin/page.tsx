import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import { registrations } from "../../db/schema";
import RegistrationsView, { type Row } from "./registrations-view";

// Never prerendered and never cached: the list changes with every registration, and a cached
// copy of it is a copy of delegates' personal data sitting somewhere it should not be.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WIAGC admin | Registrations",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const db = await getDb();
  const rows = (await db.select().from(registrations)
    .orderBy(desc(registrations.createdAt))) as Row[];
  return <RegistrationsView rows={rows} />;
}
