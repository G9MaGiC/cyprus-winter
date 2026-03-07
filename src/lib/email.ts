/**
 * Booking confirmation emails via Resend. Optional: skip if RESEND_API_KEY not set.
 */
import { Resend } from "resend";
import type { Booking } from "./bookings";
import { SITE_URL } from "./site-url";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "Cyprus Winter <bookings@cyprus-winter.app>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendBookingConfirmation(booking: Booking): Promise<boolean> {
  if (!resend) return false;

  const guestName = escapeHtml(booking.guestName);
  const providerName = escapeHtml(booking.providerName);
  const date = escapeHtml(booking.date);
  const partySize = String(booking.partySize);

  const isGuide = booking.type === "guide_tour";
  const entityLabel = isGuide ? "guided hike" : "tasting";
  const confirmBy = isGuide ? "the guide" : "the winery";

  try {
    const { error } = await resend.emails.send({
      from,
      to: booking.guestEmail,
      subject: `Booking request: ${providerName} | Cyprus Winter`,
      html: `
        <h2>Booking request received</h2>
        <p>Hi ${guestName},</p>
        <p>Your ${entityLabel} request for <strong>${providerName}</strong> has been submitted.</p>
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Party size:</strong> ${partySize}</li>
          <li><strong>Status:</strong> Pending (${confirmBy} will confirm by email)</li>
        </ul>
        <p>You can view your bookings at: <a href="${SITE_URL}/bookings">My Bookings</a></p>
        <p>Cyprus Winter</p>
      `,
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

/**
 * Send booking request to verified partner winery. Called when winery has partnerEmail and isVerified.
 */
export async function sendBookingRequestToWinery(
  booking: Booking,
  winery: { name: string; partnerEmail: string }
): Promise<boolean> {
  if (!resend) return false;

  const guestName = escapeHtml(booking.guestName);
  const guestEmail = escapeHtml(booking.guestEmail);
  const providerName = escapeHtml(winery.name);
  const date = escapeHtml(booking.date);
  const partySize = String(booking.partySize);
  const notes = booking.notes ? escapeHtml(booking.notes) : "(none)";

  try {
    const { error } = await resend.emails.send({
      from,
      to: winery.partnerEmail,
      subject: `[Cyprus Winter] New tasting request: ${guestName} | ${date}`,
      html: `
        <h2>New booking request from Cyprus Winter</h2>
        <p>A guest has requested a tasting at <strong>${providerName}</strong>.</p>
        <ul>
          <li><strong>Guest:</strong> ${guestName}</li>
          <li><strong>Email:</strong> ${guestEmail}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Party size:</strong> ${partySize}</li>
          <li><strong>Notes:</strong> ${notes}</li>
        </ul>
        <p>Please reply directly to the guest to confirm availability.</p>
        <p>Cyprus Winter</p>
      `,
    });
    if (error) {
      console.error("Resend winery notification error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Winery notification send error:", err);
    return false;
  }
}

/**
 * Send booking request to verified partner guide. Called when guide has partnerEmail and isVerified.
 */
export async function sendBookingRequestToGuide(
  booking: Booking,
  guide: { name: string; partnerEmail: string },
  trailName?: string
): Promise<boolean> {
  if (!resend) return false;

  const guestName = escapeHtml(booking.guestName);
  const guestEmail = escapeHtml(booking.guestEmail);
  const providerName = escapeHtml(guide.name);
  const date = escapeHtml(booking.date);
  const partySize = String(booking.partySize);
  const notes = booking.notes ? escapeHtml(booking.notes) : "(none)";
  const trailLine = trailName
    ? `<li><strong>Trail:</strong> ${escapeHtml(trailName)}</li>`
    : "";

  try {
    const { error } = await resend.emails.send({
      from,
      to: guide.partnerEmail,
      subject: `[Cyprus Winter] New guide request: ${guestName} | ${date}`,
      html: `
        <h2>New booking request from Cyprus Winter</h2>
        <p>A guest has requested a guided hike with <strong>${providerName}</strong>.</p>
        <ul>
          <li><strong>Guest:</strong> ${guestName}</li>
          <li><strong>Email:</strong> ${guestEmail}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Party size:</strong> ${partySize}</li>
          ${trailLine}
          <li><strong>Notes:</strong> ${notes}</li>
        </ul>
        <p>Please reply directly to the guest to confirm availability.</p>
        <p>Cyprus Winter</p>
      `,
    });
    if (error) {
      console.error("Resend guide notification error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Guide notification send error:", err);
    return false;
  }
}
