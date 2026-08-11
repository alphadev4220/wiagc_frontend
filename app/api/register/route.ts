import { cookies } from "next/headers";
import { getDb } from "../../../db";
import { eq } from "drizzle-orm";
import { registrations } from "../../../db/schema";
import { sendConfirmationEmail } from "../../../lib/email";
import { PREVIEW_COOKIE, registrationOpen } from "../../../lib/gate";

const ticketNames: Record<string,string> = { general:"General Delegate", premium:"Premium Delegate", vip:"VIP Delegate", online:"Online Delegate" };

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    // The cover in app/cover.tsx is only paint. This is what actually stops a delegate being
    // written before the office opens registration -- an overlay can be removed in devtools, and
    // this endpoint can be POSTed to directly.
    const preview = (await cookies()).get(PREVIEW_COOKIE)?.value === "on";
    if (!registrationOpen() && !preview) {
      return Response.json(
        { error: "Registration is not open yet. Contact wiaglobal1@gmail.com to reserve a place." },
        { status: 503 },
      );
    }

    const payload = await request.json() as Record<string, unknown>;
    const firstName = text(payload.firstName, 80);
    const lastName = text(payload.lastName, 80);
    const email = text(payload.email, 200).toLowerCase();
    const phone = text(payload.phone, 50);
    const country = text(payload.country, 100);
    const ticketType = text(payload.ticketType, 30);
    const attendanceDays = Array.isArray(payload.attendanceDays)
      ? payload.attendanceDays.map((item) => text(item, 30)).filter(Boolean)
      : [];

    if (!firstName || !lastName || !email || !phone || !country || !ticketType || attendanceDays.length === 0) {
      return Response.json({ error: "Complete all required registration fields." }, { status: 400 });
    }
    if (!email.includes("@") || !email.includes(".")) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (payload.consent !== true) {
      return Response.json({ error: "Registration consent is required." }, { status: 400 });
    }

    const confirmationCode = `WIA26-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const db = await getDb();
    const [registration] = await db.insert(registrations).values({
      confirmationCode,
      title: text(payload.title, 30), firstName, lastName, email, phone, country,
      city: text(payload.city, 100), churchOrganisation: text(payload.churchOrganisation, 180), role: text(payload.role, 120),
      ticketType, attendanceDays: JSON.stringify(attendanceDays),
      accommodation: text(payload.accommodation, 30), roomType: text(payload.roomType, 80), checkIn: text(payload.checkIn, 30), checkOut: text(payload.checkOut, 30),
      airportTransfer: text(payload.airportTransfer, 30), arrivalAirport: text(payload.arrivalAirport, 120), arrivalFlight: text(payload.arrivalFlight, 50), arrivalDateTime: text(payload.arrivalDateTime, 40), departureFlight: text(payload.departureFlight, 50), departureDateTime: text(payload.departureDateTime, 40), hotelShuttle: text(payload.hotelShuttle, 20),
      mealPreference: text(payload.mealPreference, 40), dietaryNeeds: text(payload.dietaryNeeds, 800), accessibilityNeeds: text(payload.accessibilityNeeds, 800), emergencyName: text(payload.emergencyName, 120), emergencyPhone: text(payload.emergencyPhone, 50), paymentStatus: text(payload.paymentStatus, 30), notes: text(payload.notes, 1000), consent: true,
    }).returning({ confirmationCode: registrations.confirmationCode, firstName: registrations.firstName, lastName: registrations.lastName, ticketType: registrations.ticketType, createdAt: registrations.createdAt });

    const fullName = `${registration.firstName} ${registration.lastName}`;
    let emailStatus = "failed";
    try {
      emailStatus = await sendConfirmationEmail({ to:email, fullName, confirmationCode, ticketName:ticketNames[ticketType] ?? ticketType, country, origin:new URL(request.url).origin });
    } catch (emailError) {
      console.error("Confirmation email error", emailError);
    }
    await db.update(registrations).set({ emailStatus }).where(eq(registrations.confirmationCode, confirmationCode));

    return Response.json({ registration: { ...registration, fullName, country, emailStatus } }, { status: 201 });
  } catch (error) {
    console.error("Registration error", error);
    return Response.json({ error: "We could not save your registration. Please try again." }, { status: 500 });
  }
}
