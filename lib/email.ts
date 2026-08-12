import { EVENT, VENUE_LINE } from "./event";

type EmailDetails = {
  to: string;
  fullName: string;
  confirmationCode: string;
  ticketName: string;
  country: string;
  origin: string;
};

export async function sendConfirmationEmail(details: EmailDetails) {
  // PORTED FROM CLOUDFLARE: `cloudflare:workers` does not exist under Node, so secrets come from
  // the process environment instead. Returning "not_configured" when either value is absent is the
  // generated behaviour and is kept on purpose -- a missing API key must not fail the
  // registration itself, only the confirmation email.
  const runtime = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONFIRMATION_FROM: process.env.CONFIRMATION_FROM,
  };
  if (!runtime.RESEND_API_KEY || !runtime.CONFIRMATION_FROM) return "not_configured";

  const qrUrl = `${details.origin}/api/qr?code=${encodeURIComponent(details.confirmationCode)}`;
  const verifyUrl = `${details.origin}/verify/${encodeURIComponent(details.confirmationCode)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "authorization": `Bearer ${runtime.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: runtime.CONFIRMATION_FROM,
      to: [details.to],
      subject: `Conference registration confirmed: ${details.confirmationCode}`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f6f1e7;padding:32px;color:#071521">
          <div style="max-width:620px;margin:auto;background:#fff;padding:36px;border-top:6px solid #d7a431">
            <p style="color:#a87613;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Word In Action Global Conference</p>
            <h1 style="font-family:Georgia,serif">Registration confirmed</h1>
            <p>Dear ${escapeHtml(details.fullName)},</p>
            <p>Your registration for ${EVENT.dates} at ${VENUE_LINE} has been recorded.</p>
            <div style="background:#071521;color:#fff;padding:22px;text-align:center;margin:25px 0">
              <small>CONFIRMATION NUMBER</small><br><strong style="font-size:25px;color:#d7a431">${details.confirmationCode}</strong>
            </div>
            <p><strong>Package:</strong> ${escapeHtml(details.ticketName)}<br><strong>Country:</strong> ${escapeHtml(details.country)}</p>
            <div style="text-align:center;margin:28px 0"><img src="${qrUrl}" width="210" height="210" alt="Delegate QR code"><p>Present this QR code at conference check-in.</p></div>
            <p style="text-align:center"><a href="${verifyUrl}" style="display:inline-block;background:#d7a431;color:#071521;text-decoration:none;font-weight:bold;padding:14px 22px">Open confirmation</a></p>
            <p style="font-size:13px;color:#60707c;margin-top:30px">Contact: wiaglobal1@gmail.com · 067 043 9548</p>
          </div>
        </div>`,
    }),
  });
  return response.ok ? "sent" : "failed";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}
