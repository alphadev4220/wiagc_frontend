import { eq } from "drizzle-orm";
import { EVENT, VENUE_LINE } from "../../../lib/event";
import { getDb } from "../../../db";
import { registrations } from "../../../db/schema";

const ticketNames: Record<string,string> = { general:"General Delegate", premium:"Premium Delegate", vip:"VIP Delegate", online:"Online Delegate" };

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^WIA26-[A-Z0-9]{8}$/.test(code.toUpperCase())) return <VerificationMissing />;
  const db = await getDb();
  const [delegate] = await db.select({ confirmationCode:registrations.confirmationCode, title:registrations.title, firstName:registrations.firstName, lastName:registrations.lastName, country:registrations.country, ticketType:registrations.ticketType, createdAt:registrations.createdAt }).from(registrations).where(eq(registrations.confirmationCode, code.toUpperCase())).limit(1);
  if (!delegate) return <VerificationMissing />;
  return <main className="verify-shell"><section className="verify-card"><div className="success-mark">✓</div><p className="eyebrow gold">Valid delegate registration</p><h1>{delegate.title} {delegate.firstName} {delegate.lastName}</h1><img className="qr-image" src={`/api/qr?code=${delegate.confirmationCode}`} alt={`QR code for ${delegate.confirmationCode}`} /><div className="confirmation-code"><span>Confirmation number</span><strong>{delegate.confirmationCode}</strong></div><dl className="summary-list"><div><dt>Country</dt><dd>{delegate.country}</dd></div><div><dt>Package</dt><dd>{ticketNames[delegate.ticketType] ?? delegate.ticketType}</dd></div><div><dt>Event</dt><dd>{EVENT.dates}</dd></div></dl><p className="small-copy">Word In Action Global Conference · {VENUE_LINE}</p></section></main>;
}

function VerificationMissing() { return <main className="verify-shell"><section className="verify-card"><p className="eyebrow gold">Registration check</p><h1>Confirmation not found</h1><p>Check the QR code or confirmation number. Contact wiaglobal1@gmail.com for assistance.</p><a className="primary-button inline-button" href="/">Return to registration</a></section></main>; }
