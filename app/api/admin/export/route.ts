import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { registrations } from "../../../../db/schema";

// CSV of every registration, for the conference office's own spreadsheet.
// Protected by the same middleware rule as /admin -- see middleware.ts. Without that this would
// be an unauthenticated dump of every delegate's contact details.
export const dynamic = "force-dynamic";

const COLUMNS: [string, (row: Record<string, unknown>) => unknown][] = [
  ["Registered", (r) => r.createdAt],
  ["Confirmation code", (r) => r.confirmationCode],
  ["Title", (r) => r.title],
  ["First name", (r) => r.firstName],
  ["Last name", (r) => r.lastName],
  ["Email", (r) => r.email],
  ["Phone", (r) => r.phone],
  ["Country", (r) => r.country],
  ["City", (r) => r.city],
  ["Church or organisation", (r) => r.churchOrganisation],
  ["Role", (r) => r.role],
  ["Package", (r) => r.ticketType],
  // stored as a JSON array; flattened so the column reads as text in a spreadsheet
  ["Attendance days", (r) => {
    try {
      const parsed = JSON.parse(String(r.attendanceDays));
      return Array.isArray(parsed) ? parsed.join("; ") : r.attendanceDays;
    } catch { return r.attendanceDays; }
  }],
  ["Accommodation", (r) => r.accommodation],
  ["Room type", (r) => r.roomType],
  ["Check in", (r) => r.checkIn],
  ["Check out", (r) => r.checkOut],
  ["Airport transfer", (r) => r.airportTransfer],
  ["Arrival airport", (r) => r.arrivalAirport],
  ["Arrival flight", (r) => r.arrivalFlight],
  ["Arrival date/time", (r) => r.arrivalDateTime],
  ["Departure flight", (r) => r.departureFlight],
  ["Departure date/time", (r) => r.departureDateTime],
  ["Hotel shuttle", (r) => r.hotelShuttle],
  ["Meal preference", (r) => r.mealPreference],
  ["Dietary needs", (r) => r.dietaryNeeds],
  ["Accessibility or medical", (r) => r.accessibilityNeeds],
  ["Emergency contact", (r) => r.emergencyName],
  ["Emergency phone", (r) => r.emergencyPhone],
  ["Payment status", (r) => r.paymentStatus],
  ["Confirmation email", (r) => r.emailStatus],
  ["Notes", (r) => r.notes],
];

/** RFC 4180 quoting, plus a guard against spreadsheet formula injection: a cell opening with
 *  = + - @ is executed as a formula by Excel and Sheets, and these cells are attacker-supplied
 *  free text. Prefixing an apostrophe keeps the value readable and inert. */
function cell(value: unknown) {
  const text = value == null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  const lines = [COLUMNS.map(([header]) => cell(header)).join(",")];
  for (const row of rows) {
    lines.push(COLUMNS.map(([, read]) => cell(read(row as Record<string, unknown>))).join(","));
  }
  // BOM so Excel opens the file as UTF-8 -- without it the en dashes and any non-ASCII name
  // arrive mojibaked.
  const body = `﻿${lines.join("\r\n")}\r\n`;
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="wiagc-registrations-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
