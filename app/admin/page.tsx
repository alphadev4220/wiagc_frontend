import type { Metadata } from "next";
import { cookies } from "next/headers";
import { asc, desc } from "drizzle-orm";
import { getDb } from "../../db";
import { registrations, speakers } from "../../db/schema";
import { ADMIN_COOKIE, adminToken, hasAdminSession } from "../../lib/admin-auth";
import type { Speaker } from "../../lib/speakers";
import LoginCard from "./login-card";
import RegistrationsView, { type Row } from "./registrations-view";
import SpeakersPanel from "./speakers-panel";

// Never prerendered and never cached: the list changes with every registration, and a cached
// copy of it is a copy of delegates' personal data sitting somewhere it should not be.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WIAGC admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }:
{ searchParams: Promise<Record<string, string | string[] | undefined>> }) {
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

  const view = (await searchParams).view === "speakers" ? "speakers" : "registrations";
  const db = await getDb();

  if (view === "speakers") {
    const people = (await db.select({
      id: speakers.id, group: speakers.group, name: speakers.name, country: speakers.country,
      role: speakers.role, bio: speakers.bio, photoPath: speakers.photoPath,
      photoType: speakers.photoType, sortOrder: speakers.sortOrder,
    }).from(speakers).orderBy(asc(speakers.sortOrder), asc(speakers.id))) as Speaker[];
    return (
      <main className="admin-shell">
        <AdminHeader view={view} />
        <SpeakersPanel speakers={people} />
      </main>
    );
  }

  const rows = (await db.select().from(registrations)
    .orderBy(desc(registrations.createdAt))) as Row[];
  return <RegistrationsView rows={rows} header={<AdminHeader view={view} />} />;
}

/** Shared masthead. Rendered on the server and handed to the client views so both tabs carry the
 *  same header without either owning it. */
function AdminHeader({ view }: { view: string }) {
  return (
    <header className="admin-head">
      <div>
        <p className="eyebrow gold">Word In Action Global Conference</p>
        <h1>{view === "speakers" ? "Speakers on the public site" : "Registrations"}</h1>
        <nav className="admin-tabs">
          <a className={view === "registrations" ? "on" : ""} href="/admin">Registrations</a>
          <a className={view === "speakers" ? "on" : ""} href="/admin?view=speakers">Speakers</a>
        </nav>
      </div>
      <div className="admin-actions">
        {view === "registrations" &&
          <a className="primary-button inline-button" href="/api/admin/export">Download CSV</a>}
        <a className="admin-link" href="/">View the public site</a>
        <SignOut />
      </div>
    </header>
  );
}

function SignOut() {
  // A plain form POST rather than fetch, so this stays a server component. Logout must be POST:
  // a GET version can be fired by any <img> on any other site.
  return (
    <form action="/api/admin/logout" method="post">
      <button className="admin-link admin-signout" type="submit">Sign out</button>
    </form>
  );
}
