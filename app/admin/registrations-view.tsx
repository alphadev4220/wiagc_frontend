"use client";

import { useMemo, useState } from "react";
import { EVENT } from "../../lib/event";

export type Row = {
  id: number;
  confirmationCode: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  churchOrganisation: string;
  role: string;
  ticketType: string;
  attendanceDays: string;
  accommodation: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  airportTransfer: string;
  arrivalAirport: string;
  arrivalFlight: string;
  arrivalDateTime: string;
  departureFlight: string;
  departureDateTime: string;
  hotelShuttle: string;
  mealPreference: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  emergencyName: string;
  emergencyPhone: string;
  paymentStatus: string;
  emailStatus: string;
  notes: string;
  consent: boolean;
  createdAt: string;
};

const TICKETS: Record<string, string> = {
  general: "General", premium: "Premium", vip: "VIP", online: "Online",
};
const DAYS = ["17 September", "18 September", "19 September"];

/** attendance_days is stored as a JSON array in a text column; a bad row must not blank the page. */
function days(row: Row): string[] {
  try {
    const parsed = JSON.parse(row.attendanceDays);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function stamp(value: string) {
  const d = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 16).replace("T", " ");
}

/** True when the delegate asked for something the office has to action. */
function needsAction(row: Row) {
  return row.accommodation !== "no" || row.airportTransfer !== "no" ||
    row.hotelShuttle === "yes" || !!row.dietaryNeeds || !!row.accessibilityNeeds;
}

export default function RegistrationsView({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [ticket, setTicket] = useState("all");
  const [open, setOpen] = useState<number | null>(null);

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (ticket !== "all" && row.ticketType !== ticket) return false;
      if (!q) return true;
      // One box over the fields the office actually searches by. A delegate rings up quoting a
      // confirmation code, a surname or the email they registered with, and any of the three
      // has to find them.
      return [row.confirmationCode, row.firstName, row.lastName, row.email, row.phone,
        row.country, row.churchOrganisation].join(" ").toLowerCase().includes(q);
    });
  }, [rows, query, ticket]);

  const stats = useMemo(() => {
    const byTicket: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    let accommodation = 0, transfer = 0, dietary = 0, access = 0, emailed = 0, paid = 0;
    for (const row of rows) {
      byTicket[row.ticketType] = (byTicket[row.ticketType] || 0) + 1;
      for (const d of days(row)) byDay[d] = (byDay[d] || 0) + 1;
      if (row.accommodation !== "no") accommodation += 1;
      if (row.airportTransfer !== "no") transfer += 1;
      if (row.dietaryNeeds) dietary += 1;
      if (row.accessibilityNeeds) access += 1;
      if (row.emailStatus === "sent") emailed += 1;
      if (row.paymentStatus === "proof-sent" || row.paymentStatus === "sponsored") paid += 1;
    }
    return { byTicket, byDay, accommodation, transfer, dietary, access, emailed, paid };
  }, [rows]);

  return (
    <main className="admin-shell">
      <header className="admin-head">
        <div>
          <p className="eyebrow gold">Word In Action Global Conference</p>
          <h1>Registrations</h1>
          <p className="admin-sub">{EVENT.dates} · {EVENT.venue}</p>
        </div>
        <div className="admin-actions">
          <a className="primary-button inline-button" href="/api/admin/export">Download CSV</a>
          <a className="admin-link" href="/">View the public site</a>
          {/* Basic auth had no way to sign out short of closing the browser. On a shared office
              machine that left the delegate list open to whoever sat down next. */}
          <button className="admin-link admin-signout" onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            window.location.reload();
          }}>Sign out</button>
        </div>
      </header>

      <section className="admin-strip">
        <div className="admin-stat">
          <span>Registered</span><strong>{rows.length}</strong>
          <small>{stats.emailed} confirmation email{stats.emailed === 1 ? "" : "s"} sent</small>
        </div>
        {Object.keys(TICKETS).map((key) => (
          <div className="admin-stat" key={key}>
            <span>{TICKETS[key]}</span><strong>{stats.byTicket[key] || 0}</strong>
            <small>delegates</small>
          </div>
        ))}
        <div className="admin-stat">
          <span>Accommodation</span><strong>{stats.accommodation}</strong>
          <small>requests to action</small>
        </div>
        <div className="admin-stat">
          <span>Transfers</span><strong>{stats.transfer}</strong>
          <small>airport pickups</small>
        </div>
        <div className="admin-stat">
          {/* Surfaced on the summary, not buried in a row: these are the two the venue and the
              caterer need in advance, and they are easy to miss inside a long detail panel. */}
          <span>Dietary / access</span><strong>{stats.dietary} / {stats.access}</strong>
          <small>special requirements</small>
        </div>
      </section>

      <section className="admin-strip admin-days">
        {DAYS.map((day) => (
          <div className="admin-stat" key={day}>
            <span>{day}</span><strong>{stats.byDay[day] || 0}</strong><small>attending</small>
          </div>
        ))}
      </section>

      <div className="admin-filters">
        <input className="admin-search" value={query} placeholder="Search name, email, phone, code or church"
               onChange={(event) => setQuery(event.target.value)} />
        <select className="admin-select" value={ticket} onChange={(event) => setTicket(event.target.value)}>
          <option value="all">All packages</option>
          {Object.keys(TICKETS).map((key) => <option key={key} value={key}>{TICKETS[key]}</option>)}
        </select>
        <span className="admin-count">{view.length} of {rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">No registrations yet. They appear here the moment the form is submitted.</p>
      ) : (
        <div className="admin-tablewrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registered</th><th>Code</th><th>Delegate</th><th>Contact</th>
                <th>Country</th><th>Package</th><th>Days</th><th>Requests</th><th>Payment</th><th />
              </tr>
            </thead>
            <tbody>
              {view.map((row) => {
                const isOpen = open === row.id;
                return [
                  <tr key={row.id} className={isOpen ? "is-open" : undefined}>
                    <td className="admin-dim">{stamp(row.createdAt)}</td>
                    <td><code>{row.confirmationCode}</code></td>
                    <td>
                      <strong>{[row.title, row.firstName, row.lastName].filter(Boolean).join(" ")}</strong>
                      {row.churchOrganisation && <small>{row.churchOrganisation}</small>}
                    </td>
                    <td>
                      <a href={`mailto:${row.email}`}>{row.email}</a>
                      <small>{row.phone}</small>
                    </td>
                    <td>{row.country}{row.city && <small>{row.city}</small>}</td>
                    <td>{TICKETS[row.ticketType] || row.ticketType}</td>
                    <td className="admin-dim">{days(row).map((d) => d.split(" ")[0]).join(", ") || "—"}</td>
                    <td>{needsAction(row)
                      ? <span className="admin-flag">action</span>
                      : <span className="admin-dim">—</span>}</td>
                    <td>
                      {/* An early row was written before payment_status had a value. An empty
                          string rendered as a coloured pill with nothing in it, which reads as a
                          broken cell rather than as missing data. */}
                      {row.paymentStatus ? (
                        <span className={`admin-pill ${row.paymentStatus === "pending" ? "warn" : "ok"}`}>
                          {row.paymentStatus.replace("-", " ")}
                        </span>
                      ) : <span className="admin-dim">—</span>}
                    </td>
                    <td>
                      <button className="admin-toggle" onClick={() => setOpen(isOpen ? null : row.id)}>
                        {isOpen ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>,
                  isOpen && (
                    <tr key={`${row.id}-detail`} className="admin-detailrow">
                      <td colSpan={10}>
                        <div className="admin-detail">
                          <Detail label="Role or position" value={row.role} />
                          <Detail label="Accommodation" value={row.accommodation} />
                          <Detail label="Room type" value={row.roomType} />
                          <Detail label="Check in / out" value={[row.checkIn, row.checkOut].filter(Boolean).join(" → ")} />
                          <Detail label="Airport transfer" value={row.airportTransfer} />
                          <Detail label="Arrival airport" value={row.arrivalAirport} />
                          <Detail label="Arrival" value={[row.arrivalFlight, row.arrivalDateTime].filter(Boolean).join(" · ")} />
                          <Detail label="Departure" value={[row.departureFlight, row.departureDateTime].filter(Boolean).join(" · ")} />
                          <Detail label="Hotel shuttle" value={row.hotelShuttle} />
                          <Detail label="Meal preference" value={row.mealPreference} />
                          <Detail label="Dietary needs" value={row.dietaryNeeds} wide />
                          <Detail label="Accessibility / medical" value={row.accessibilityNeeds} wide />
                          <Detail label="Emergency contact" value={[row.emergencyName, row.emergencyPhone].filter(Boolean).join(" · ")} />
                          <Detail label="Confirmation email" value={row.emailStatus} />
                          <Detail label="Message to the office" value={row.notes} wide />
                          <div className="admin-field wide">
                            <span>Delegate pass</span>
                            <a href={`/verify/${row.confirmationCode}`} target="_blank" rel="noreferrer">
                              Open the verification page
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

/** An empty optional field is shown as a dash rather than hidden, so a blank reads as "they did
 *  not answer" instead of leaving the office unsure whether the question was even asked. */
function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`admin-field${wide ? " wide" : ""}`}>
      <span>{label}</span>
      <strong className={value ? undefined : "admin-dim"}>{value || "—"}</strong>
    </div>
  );
}
