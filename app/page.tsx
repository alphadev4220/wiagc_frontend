"use client";

import { FormEvent, useMemo, useState } from "react";
import { countries } from "../lib/countries";

type Registration = {
  confirmationCode: string;
  fullName: string;
  ticketType: string;
  country: string;
  emailStatus: string;
  createdAt: string;
};

const ticketOptions = [
  { value: "general", title: "General Delegate", text: "Conference access for all three days" },
  { value: "premium", title: "Premium Delegate", text: "Conference access plus reserved seating and daily refreshments" },
  { value: "vip", title: "VIP Delegate", text: "Priority seating, VIP hospitality and selected speaker sessions" },
  { value: "online", title: "Online Delegate", text: "Livestream access for remote delegates" },
];

const initialForm = {
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "South Africa",
  city: "",
  churchOrganisation: "",
  role: "",
  ticketType: "general",
  attendanceDays: ["17 September", "18 September", "19 September"],
  accommodation: "no",
  roomType: "",
  checkIn: "",
  checkOut: "",
  airportTransfer: "no",
  arrivalAirport: "",
  arrivalFlight: "",
  arrivalDateTime: "",
  departureFlight: "",
  departureDateTime: "",
  hotelShuttle: "no",
  mealPreference: "standard",
  dietaryNeeds: "",
  accessibilityNeeds: "",
  emergencyName: "",
  emergencyPhone: "",
  paymentStatus: "pending",
  notes: "",
  consent: false,
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<Registration | null>(null);

  const progress = useMemo(() => `${step} of 4`, [step]);

  function update(name: string, value: string | boolean | string[]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleDay(day: string) {
    const next = form.attendanceDays.includes(day)
      ? form.attendanceDays.filter((item) => item !== day)
      : [...form.attendanceDays, day];
    update("attendanceDays", next);
  }

  function validateStep() {
    setError("");
    if (step === 1 && (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country)) {
      setError("Complete all required personal details.");
      return false;
    }
    if (step === 2 && form.attendanceDays.length === 0) {
      setError("Select at least one conference day.");
      return false;
    }
    if (step === 3 && form.airportTransfer === "yes" && (!form.arrivalAirport || !form.arrivalDateTime)) {
      setError("Add your airport and arrival date for the transfer request.");
      return false;
    }
    return true;
  }

  function nextStep() {
    if (validateStep()) setStep((current) => Math.min(4, current + 1));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.consent) {
      setError("Confirm the information and privacy consent before submitting.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed.");
      setRegistration(result.registration);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (registration) {
    return (
      <main className="site-shell success-shell">
        <section className="success-card">
          <div className="success-mark">✓</div>
          <p className="eyebrow">Registration confirmed</p>
          <h1>Welcome, {registration.fullName}</h1>
          <p>Your place at the Word In Action Global Conference has been recorded.</p>
          <div className="confirmation-code">
            <span>Confirmation number</span>
            <strong>{registration.confirmationCode}</strong>
          </div>
          <img className="qr-image" src={`/api/qr?code=${registration.confirmationCode}`} alt={`QR code for ${registration.confirmationCode}`} />
          <p className={`email-notice ${registration.emailStatus === "sent" ? "sent" : "pending"}`}>{registration.emailStatus === "sent" ? "A confirmation email with this QR code has been sent." : "Your registration is secure. Email delivery is awaiting conference sender activation."}</p>
          <dl className="summary-list">
            <div><dt>Package</dt><dd>{ticketOptions.find((item) => item.value === registration.ticketType)?.title}</dd></div>
            <div><dt>Dates</dt><dd>17–19 September 2026</dd></div>
            <div><dt>Venue</dt><dd>Gallagher Convention Centre, Midrand</dd></div>
          </dl>
          <p className="small-copy">Present your QR code at conference check-in. Keep your confirmation number for payment, accommodation and transport communication.</p>
          <button className="primary-button" onClick={() => window.print()}>Save or print confirmation</button>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <header className="hero">
        <nav className="topbar">
          <div className="wordmark"><span>WIAGC</span> Churches in the Cities</div>
          <div className="top-links">
            <a href="#speakers" className="nav-link">Key speakers</a>
            <a href="#register" className="nav-cta">Register now</a>
          </div>
        </nav>
        <div className="hero-content">
          <p className="ministry-line">Churches in the Cities presents</p>
          <p className="eyebrow">17–19 September 2026 · Midrand, South Africa</p>
          <h1>Word In Action<br />Global Conference</h1>
          <p className="theme">The Gathering of the Apostolic People</p>
          <div className="event-facts">
            <div><span>Date</span><strong>17–19 September 2026</strong></div>
            <div><span>Venue</span><strong>Gallagher Convention Centre</strong></div>
            <div><span>Location</span><strong>Midrand, Gauteng</strong></div>
          </div>
        </div>
      </header>

      <section id="speakers" className="speakers-section">
        <div className="speakers-heading">
          <p className="eyebrow gold">Meet the key guest speakers</p>
          <h2>Voices joining the global gathering</h2>
          <p>Two international ministry leaders will join the Word In Action Global Conference for apostolic teaching, ministry and a life-changing encounter.</p>
        </div>
        <div className="speaker-grid">
          <article className="speaker-card">
            <div className="speaker-photo-wrap">
              <img className="speaker-photo" src="/speakers/1000199588.jpg" alt="Pastor Robert Kayanja" />
            </div>
            <div className="speaker-profile">
              <span>Key Guest Speaker</span>
              <h3>Pastor Robert Kayanja</h3>
              <strong>Uganda</strong>
              <p>A Christian leader and minister joining the conference from Uganda. His session will form part of the conference’s apostolic teaching and ministry programme.</p>
            </div>
          </article>
          <article className="speaker-card">
            <div className="speaker-photo-wrap">
              <img className="speaker-photo" src="/speakers/1000202498.jpg" alt="Dr Francis Myles" />
            </div>
            <div className="speaker-profile">
              <span>Key Guest Speaker</span>
              <h3>Dr Francis Myles</h3>
              <strong>USA</strong>
              <p>A Christian leader, author and minister joining the conference from the United States. His session will contribute to the conference’s apostolic teaching and global ministry focus.</p>
            </div>
          </article>
        </div>
        <div className="hosts-heading">
          <p className="eyebrow gold">Conference hosts</p>
          <h2>Welcoming the global gathering</h2>
        </div>
        <div className="speaker-grid host-grid">
          <article className="speaker-card host-card">
            <div className="speaker-photo-wrap">
              <img className="speaker-photo" src="/hosts/apostle-samuel-fidelis.jpg" alt="Apostle Samuel Fidelis" />
            </div>
            <div className="speaker-profile">
              <span>Conference Host</span>
              <h3>Apostle Samuel Fidelis</h3>
              <strong>South Africa</strong>
              <p>Host of the Word In Action Global Conference and leader of the gathering.</p>
            </div>
          </article>
          <article className="speaker-card host-card">
            <div className="speaker-photo-wrap">
              <img className="speaker-photo" src="/hosts/dr-sam-zungu-fidelis.jpg" alt="Dr Sam Zungu-Fidelis" />
            </div>
            <div className="speaker-profile">
              <span>Conference Host</span>
              <h3>Dr Sam Zungu-Fidelis</h3>
              <strong>South Africa</strong>
              <p>Host of the Word In Action Global Conference and partner in welcoming delegates from across the world.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="intro-section">
        <div>
          <p className="eyebrow gold">Registration</p>
          <h2>Reserve your place</h2>
        </div>
        <p>Register once for the conference, accommodation support, airport transfers, hotel shuttles and dietary requirements. Your confirmation number will appear after submission.</p>
      </section>

      <section id="register" className="registration-layout">
        <aside className="steps-card" aria-label="Registration progress">
          <p className="step-count">Step {progress}</p>
          {/* `as const` so the tuples infer as [1,"..."] rather than (string|number)[].
              Without it `number` is string|number and `step > number` fails to type check --
              a pre-existing error in the generated source, not a porting change. */}
          {([
            [1, "Delegate details"],
            [2, "Conference package"],
            [3, "Travel and hospitality"],
            [4, "Review and submit"],
          ] as const).map(([number, label]) => (
            <button key={number} type="button" className={`step-item ${step === number ? "active" : ""} ${step > number ? "complete" : ""}`} onClick={() => Number(number) < step && setStep(Number(number))}>
              <span>{step > number ? "✓" : number}</span>{label}
            </button>
          ))}
          <div className="help-box">
            <strong>Need assistance?</strong>
            <a href="tel:+27670439548">067 043 9548</a>
            <a href="mailto:wiaglobal1@gmail.com">wiaglobal1@gmail.com</a>
          </div>
        </aside>

        <form className="registration-form" onSubmit={submit}>
          {step === 1 && (
            <fieldset>
              <legend>Delegate details</legend>
              <p className="section-note">Enter the details as they should appear on your conference record.</p>
              <div className="form-grid three">
                <label>Title<select value={form.title} onChange={(e) => update("title", e.target.value)}><option value="">Select</option><option>Pastor</option><option>Apostle</option><option>Dr</option><option>Rev</option><option>Mr</option><option>Mrs</option><option>Ms</option><option>Prof</option></select></label>
                <label>First name *<input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></label>
                <label>Last name *<input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></label>
              </div>
              <div className="form-grid two">
                <label>Email address *<input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></label>
                <label>WhatsApp or mobile number *<input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
                <label>Country *<select required value={form.country} onChange={(e) => update("country", e.target.value)}>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>
                <label>City or province<input value={form.city} onChange={(e) => update("city", e.target.value)} /></label>
                <label>Church or organisation<input value={form.churchOrganisation} onChange={(e) => update("churchOrganisation", e.target.value)} /></label>
                <label>Role or position<input value={form.role} onChange={(e) => update("role", e.target.value)} /></label>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend>Conference package</legend>
              <p className="section-note">Select your registration category and attendance days.</p>
              <div className="ticket-grid">
                {ticketOptions.map((ticket) => (
                  <label className={`ticket-option ${form.ticketType === ticket.value ? "selected" : ""}`} key={ticket.value}>
                    <input type="radio" name="ticketType" value={ticket.value} checked={form.ticketType === ticket.value} onChange={(e) => update("ticketType", e.target.value)} />
                    <span><strong>{ticket.title}</strong><small>{ticket.text}</small><em>Fee to be confirmed</em></span>
                  </label>
                ))}
              </div>
              <h3>Attendance days</h3>
              <div className="check-row">
                {["17 September", "18 September", "19 September"].map((day) => <label key={day}><input type="checkbox" checked={form.attendanceDays.includes(day)} onChange={() => toggleDay(day)} />{day}</label>)}
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset>
              <legend>Travel and hospitality</legend>
              <p className="section-note">Request support now. The conference team will confirm prices and availability.</p>
              <div className="form-grid two">
                <label>Accommodation required?<select value={form.accommodation} onChange={(e) => update("accommodation", e.target.value)}><option value="no">No</option><option value="yes">Yes</option><option value="information">Send me options</option></select></label>
                <label>Preferred room type<select value={form.roomType} onChange={(e) => update("roomType", e.target.value)} disabled={form.accommodation === "no"}><option value="">Select</option><option>Single room</option><option>Shared twin room</option><option>Family room</option><option>Budget accommodation</option></select></label>
                <label>Check-in date<input type="date" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} disabled={form.accommodation === "no"} /></label>
                <label>Check-out date<input type="date" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} disabled={form.accommodation === "no"} /></label>
                <label>Airport transfer required?<select value={form.airportTransfer} onChange={(e) => update("airportTransfer", e.target.value)}><option value="no">No</option><option value="yes">Yes, return transfer</option><option value="arrival">Arrival only</option><option value="departure">Departure only</option></select></label>
                <label>Arrival airport<select value={form.arrivalAirport} onChange={(e) => update("arrivalAirport", e.target.value)} disabled={form.airportTransfer === "no"}><option value="">Select</option><option>OR Tambo International Airport</option><option>Lanseria International Airport</option><option>Other</option></select></label>
                <label>Arrival flight number<input value={form.arrivalFlight} onChange={(e) => update("arrivalFlight", e.target.value)} disabled={form.airportTransfer === "no"} /></label>
                <label>Arrival date and time<input type="datetime-local" value={form.arrivalDateTime} onChange={(e) => update("arrivalDateTime", e.target.value)} disabled={form.airportTransfer === "no"} /></label>
                <label>Departure flight number<input value={form.departureFlight} onChange={(e) => update("departureFlight", e.target.value)} disabled={form.airportTransfer === "no"} /></label>
                <label>Departure date and time<input type="datetime-local" value={form.departureDateTime} onChange={(e) => update("departureDateTime", e.target.value)} disabled={form.airportTransfer === "no"} /></label>
                <label>Hotel shuttle required?<select value={form.hotelShuttle} onChange={(e) => update("hotelShuttle", e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></label>
                <label>Meal preference<select value={form.mealPreference} onChange={(e) => update("mealPreference", e.target.value)}><option value="standard">Standard</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="halal">Halaal</option></select></label>
                <label className="full">Dietary or allergy details<textarea value={form.dietaryNeeds} onChange={(e) => update("dietaryNeeds", e.target.value)} /></label>
                <label className="full">Accessibility or medical support needs<textarea value={form.accessibilityNeeds} onChange={(e) => update("accessibilityNeeds", e.target.value)} /></label>
                <label>Emergency contact name<input value={form.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} /></label>
                <label>Emergency contact number<input type="tel" value={form.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} /></label>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset>
              <legend>Review and submit</legend>
              <p className="section-note">Check your information before completing registration.</p>
              <div className="review-card">
                <div><span>Delegate</span><strong>{form.title} {form.firstName} {form.lastName}</strong><small>{form.email} · {form.phone}</small></div>
                <div><span>Package</span><strong>{ticketOptions.find((item) => item.value === form.ticketType)?.title}</strong><small>{form.attendanceDays.join(", ")}</small></div>
                <div><span>Hospitality</span><strong>Accommodation: {form.accommodation}</strong><small>Airport transfer: {form.airportTransfer} · Hotel shuttle: {form.hotelShuttle}</small></div>
              </div>
              <div className="form-grid two compact">
                <label>Payment status<select value={form.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value)}><option value="pending">Payment pending</option><option value="sponsored">Sponsored delegate</option><option value="group">Group payment</option><option value="proof-sent">Proof sent to office</option></select></label>
                <label>Message to the conference office<textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} /></label>
              </div>
              <label className="consent"><input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} /><span>I confirm that these details are correct. I consent to the conference team using them for registration, event communication, accommodation and transport arrangements.</span></label>
            </fieldset>
          )}

          {error && <div className="error-message" role="alert">{error}</div>}
          <div className="form-actions">
            {step > 1 && <button type="button" className="secondary-button" onClick={() => setStep((current) => current - 1)}>Back</button>}
            {step < 4 ? <button type="button" className="primary-button" onClick={nextStep}>Continue</button> : <button type="submit" className="primary-button" disabled={sending}>{sending ? "Submitting…" : "Complete registration"}</button>}
          </div>
        </form>
      </section>

      <section className="information-section">
        <p className="eyebrow gold">Important information</p>
        <div className="info-grid">
          <article><span>01</span><h3>Registration</h3><p>Each delegate receives a unique confirmation number. Bring the number and identification to conference check-in.</p></article>
          <article><span>02</span><h3>Accommodation</h3><p>Hotel options and negotiated rates will be sent after the conference office reviews your request.</p></article>
          <article><span>03</span><h3>Transport</h3><p>Airport and hotel shuttle schedules depend on submitted flight and accommodation details.</p></article>
          <article><span>04</span><h3>Payment</h3><p>Registration fees and approved payment instructions will follow. Do not pay an unverified account.</p></article>
        </div>
      </section>

      <footer><strong>WIAGC · Churches in the Cities</strong><span>17–19 September 2026 · Gallagher Convention Centre, Midrand</span></footer>
    </main>
  );
}
