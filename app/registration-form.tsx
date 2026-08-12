"use client";

import { FormEvent, useMemo, useState } from "react";
import { countries } from "../lib/countries";
import { EVENT, VENUE_LINE } from "../lib/event";

// SPEAKERS AND HOSTS.
//
// Held as data rather than repeated markup: the bios arrived as one block of copy covering
// people across all three groups, and editing six near-identical <article> blocks by hand is
// how one of them ends up with another person's paragraph. `photo` is a filename under
// /public -- an entry without one renders text-only rather than a broken image.
type Person = {
  name: string;
  country?: string;
  /** A name this person is also known by, shown beside the country. */
  aka?: string;
  role: string;
  photo?: string;
  bio?: string;
};

/** The gold line under a name. Country and alias share it rather than stacking two blocks,
 *  which would double the margin below the heading and read as two separate facts. */
function Subline({ person }: { person: Person }) {
  const parts = [person.country, person.aka ? `also known as ${person.aka}` : ""].filter(Boolean);
  return parts.length ? <strong>{parts.join(" · ")}</strong> : null;
}

const KEY_SPEAKERS: Person[] = [
  {
    name: "Pastor Robert Kayanja",
    country: "Uganda",
    role: "Key Guest Speaker",
    photo: "/speakers/1000199588.jpg",
    bio: "Pastor Robert Kayanja is a renowned Ugandan pastor, author, and global Christian leader. He is the founder and Senior Pastor of Miracle Centre Cathedral in Kampala and the founder of Robert Kayanja Ministries. For nearly four decades, he has preached the Gospel across nations, inspiring people through his message of faith, hope, restoration, and the transforming power of God.",
  },
  {
    name: "Dr Francis Myles",
    country: "USA",
    role: "Key Guest Speaker",
    photo: "/speakers/1000202498.jpg",
    bio: "Dr Francis Myles is an internationally recognised apostle, speaker, author, and teacher of the Word. He is known for his teaching on the Order of Melchizedek, healing, prophecy, faith, and Kingdom leadership. A bestselling author of more than 12 books, Dr Myles is also the founder of the Order of Melchizedek Supernatural School of Ministry and co-founder of Just Cause Foundation, which supports vulnerable communities in Africa.",
  },
];

const HOSTS: Person[] = [
  {
    name: "Apostle Samuel Fidelis",
    country: "South Africa",
    role: "Conference Host",
    photo: "/hosts/apostle-samuel-fidelis.jpg",
    bio: "Host of the Word In Action Global Conference and leader of the gathering.",
  },
  {
    name: "Dr Sam Zungu-Fidelis, PhD",
    country: "South Africa",
    role: "Conference Host",
    photo: "/hosts/dr-sam-zungu-fidelis.jpg",
    bio: "Dr Sam Zungu-Fidelis, PhD is a medical doctor, mental health and wellness specialist, researcher, author, and founder of Mental Wealth Conversations. She is a passionate advocate for shifting the conversation from mental health to mental wealth, empowering leaders, families, and communities to thrive. Dr Sam is also the author of Mental Wealth and other wellness journals.",
  },
];

const GUEST_SPEAKERS: Person[] = [
  {
    name: "Dr Victor Tuwani Phume",
    country: "South Africa",
    role: "Guest Speaker",
    photo: "/speakers/dr-victor-tuwani-pume.jpg",
    bio: "Dr Victor Tuwani Phume is a South African theologian, reverend, author, entrepreneur, and media leader. He holds a PhD in Leadership and Management and has authored numerous publications. He is the founder of Zallywood Media Group, including Tshwane TV and GauTV, and has dedicated much of his work to advancing faith, leadership, media, and community transformation.",
  },
  {
    name: "Apostle Mufaro Maposa",
    country: "Lesotho",
    role: "Guest Speaker",
    photo: "/speakers/apostle-mufaro-maposa.jpg",
    bio: "Apostle Mufaro Maposa is an apostle, prophet, teacher, and Christian leader based in Lesotho. He is the founder and General Overseer of New Testament Church and the Manifest Sons of God Movement, established in 2006. Through his ministry, he is committed to equipping believers, advancing the Gospel, and helping people walk in the fullness of their identity and faith in Christ.",
  },
  {
    // Photo replaced 2026-08-12. The previous file showed a visibly DIFFERENT man -- it was the
    // portrait supplied under the name "Apostle Splasher" and is kept at
    // /speakers/apostle-splasher.jpg in case it belongs to someone who still needs a card.
    name: "Apostle Isaac Sithole",
    country: "South Africa",
    role: "Guest Speaker",
    photo: "/speakers/apostle-isaac-sithole.png",
    bio: "Apostle Isaac Sithole is a respected Christian leader, pastor, and minister of the Gospel. He serves as Senior Pastor of Oasis of Life Family Church, where he is committed to building faith, strengthening families, and advancing the Kingdom of God. He is also actively involved in Christian leadership and initiatives that seek to bring hope, unity, and positive transformation to communities.",
  },
  {
    name: "Pastors Timsimon & Erica Kamani",
    country: "Kenya",
    role: "Guest Speakers",
    photo: "/speakers/pastors-timsimon-erica-kamani.jpg",
  },
  {
    name: "Rev Moyo",
    country: "Bulawayo, Zimbabwe",
    role: "Guest Speaker",
    photo: "/speakers/rev-moyo.jpg",
  },
  {
    name: "Dr Thandi Ngomelo",
    country: "South Africa",
    role: "Guest Speaker",
    photo: "/speakers/dr-thandi-ngomelo.jpg",
  },
];

// The conference ran 17-19 September until 2026-08-12, when a fourth day was added at the front.
// Declared once and used for both the default selection and the checkbox row: when those two
// lists were written out separately, adding a day meant remembering to edit both, and missing
// one silently drops that day from every new registration's default.
// The same strings key the per-day counts in app/admin/registrations-view.tsx.
const CONFERENCE_DAYS = ["16 September", "17 September", "18 September", "19 September"];

type Registration = {
  confirmationCode: string;
  fullName: string;
  ticketType: string;
  country: string;
  emailStatus: string;
  createdAt: string;
};

const ticketOptions = [
  { value: "general", title: "General Delegate", text: "Conference access for all four days" },
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
  attendanceDays: [...CONFERENCE_DAYS],
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

export default function RegistrationForm() {
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
            <div><dt>Dates</dt><dd>{EVENT.dates}</dd></div>
            <div><dt>Venue</dt><dd>{VENUE_LINE}</dd></div>
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
          <p className="eyebrow">{EVENT.dates} · {EVENT.region}</p>
          <h1>Word In Action<br />Global Conference</h1>
          <p className="theme">The Gathering of the Apostolic People</p>
          <div className="event-facts">
            <div><span>Date</span><strong>{EVENT.dates}</strong></div>
            <div><span>Venue</span><strong>{EVENT.venue}</strong></div>
            <div><span>Location</span><strong>{EVENT.location}</strong></div>
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
          {KEY_SPEAKERS.map((person) => (
            <article className="speaker-card" key={person.name}>
              <div className="speaker-photo-wrap">
                <img className="speaker-photo" src={person.photo} alt={person.name} />
              </div>
              <div className="speaker-profile">
                <span>{person.role}</span>
                <h3>{person.name}</h3>
                <Subline person={person} />
                <p>{person.bio}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="hosts-heading">
          <p className="eyebrow gold">Conference hosts</p>
          <h2>Welcoming the global gathering</h2>
        </div>
        <div className="speaker-grid host-grid">
          {HOSTS.map((person) => (
            <article className="speaker-card host-card" key={person.name}>
              <div className="speaker-photo-wrap">
                <img className="speaker-photo" src={person.photo} alt={person.name} />
              </div>
              <div className="speaker-profile">
                <span>{person.role}</span>
                <h3>{person.name}</h3>
                <Subline person={person} />
                <p>{person.bio}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="hosts-heading guest-heading">
          <p className="eyebrow gold">Confirmed guest speakers</p>
          <h2>Ministry voices from Africa</h2>
        </div>
        <div className="guest-grid">
          {GUEST_SPEAKERS.map((person) => (
            /* `no-photo` drops the image row entirely rather than leaving a grey placeholder
               where a face should be -- an empty frame reads as a broken page. */
            <article className={`guest-card${person.photo ? "" : " no-photo"}`} key={person.name}>
              {person.photo && (
                <div className="guest-photo-wrap">
                  <img className="speaker-photo" src={person.photo} alt={person.name} />
                </div>
              )}
              <div className="speaker-profile">
                <span>{person.role}</span>
                <h3>{person.name}</h3>
                <Subline person={person} />
                {person.bio && <p>{person.bio}</p>}
              </div>
            </article>
          ))}
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
                {CONFERENCE_DAYS.map((day) => <label key={day}><input type="checkbox" checked={form.attendanceDays.includes(day)} onChange={() => toggleDay(day)} />{day}</label>)}
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
        </div>
      </section>

      <footer><strong>WIAGC · Churches in the Cities</strong><span>{EVENT.dates} · {VENUE_LINE}</span></footer>
    </main>
  );
}
