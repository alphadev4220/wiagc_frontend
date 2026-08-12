import type { Metadata } from "next";
import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import { registrations } from "../../db/schema";
import { ADMIN_COOKIE, adminToken, hasAdminSession } from "../../lib/admin-auth";
import LoginCard from "./login-card";
import RegistrationsView, { type Row } from "./registrations-view";

// Never prerendered and never cached: the list changes with every registration, and a cached
// copy of it is a copy of delegates' personal data sitting somewhere it should not be.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WIAGC admin | Registrations",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // FAILS CLOSED. No configured password means the page is locked, not open -- and it does not
  // even offer a login form, since there is no credential that could satisfy it.
  if (!(await adminToken())) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <p className="eyebrow gold">Word In Action Global Conference</p>
          <h1>Not configured</h1>
          <p className="login-lead">
            Admin access is not set up on this server. Set WIAGC_ADMIN_PASSWORD and rebuild.
          </p>
        </section>
      </main>
    );
  }

  // The database is not touched until the session is verified.
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await hasAdminSession(session))) return <LoginCard />;

  const db = await getDb();
  const rows = (await db.select().from(registrations)
    .orderBy(desc(registrations.createdAt))) as Row[];
  return <RegistrationsView rows={rows} />;
}
