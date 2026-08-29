/**
 * Booking confirmation emails via Resend. Optional: skip if RESEND_API_KEY not set.
 */
import { Resend } from "resend";
import { getTranslations } from "next-intl/server";
import type { Booking } from "./bookings";
import { createBookingLookupToken, isBookingLookupTokenConfigured } from "./booking-lookup-token";
import { SITE_URL } from "./site-url";
import { routing, type Locale } from "@/i18n/routing";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? "Cyprus Winter <bookings@cyprus-winter.app>";

function resolveLocale(locale?: string): Locale {
  return locale && (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

function emailDir(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Guest confirmation, localized to the guest's UI locale (partner mail stays English). */
export async function sendBookingConfirmation(booking: Booking, localeInput?: string): Promise<boolean> {
  if (!resend) return false;

  const locale = resolveLocale(localeInput);
  const t = await getTranslations({ locale, namespace: "email" });
  const dir = emailDir(locale);

  const providerHtml = `<strong>${escapeHtml(booking.providerName)}</strong>`;
  const date = escapeHtml(booking.date);
  const partySize = String(booking.partySize);
  const isGuide = booking.type === "guide_tour";
  const variant = isGuide ? "Hike" : "Tasting";
  const bookingsHref = bookingLookupUrl(booking.guestEmail);
  const link = `<a href="${bookingsHref}">${escapeHtml(t("confirmation.myBookings"))}</a>`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: booking.guestEmail,
      subject: t("confirmation.subject", { provider: booking.providerName }),
      html: `
        <div dir="${dir}">
        <h2>${escapeHtml(t("confirmation.heading"))}</h2>
        <p>${escapeHtml(t("confirmation.hi", { name: booking.guestName }))}</p>
        <p>${t(`confirmation.submitted${variant}`, { provider: providerHtml })}</p>
        <ul>
          <li><strong>${escapeHtml(t("confirmation.date"))}:</strong> ${date}</li>
          <li><strong>${escapeHtml(t("confirmation.partySize"))}:</strong> ${partySize}</li>
          <li><strong>${escapeHtml(t("confirmation.status"))}:</strong> ${escapeHtml(t(`confirmation.pending${variant}`))}</li>
        </ul>
        <p><strong>${escapeHtml(t("confirmation.whatNext"))}</strong></p>
        <ol>
          <li>${escapeHtml(t("confirmation.step1"))}</li>
          <li>${escapeHtml(t(`confirmation.step2${variant}`))}</li>
          <li>${t("confirmation.step3", { link })}</li>
        </ol>
        <p>${escapeHtml(t(`confirmation.noReply${variant}`))}</p>
        <p>Cyprus Winter</p>
        </div>
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

export async function sendBookingRequestToWinery(booking: Booking, winery: { name: string; partnerEmail: string }): Promise<boolean> {
  if (!resend) return false;
  const guestName = escapeHtml(booking.guestName);
  const guestEmail = escapeHtml(booking.guestEmail);
  const providerName = escapeHtml(winery.name);
  const date = escapeHtml(booking.date);
  const partySize = String(booking.partySize);
  const notes = booking.notes ? escapeHtml(booking.notes) : "(none)";
  try {
    const { error } = await resend.emails.send({ from, to: winery.partnerEmail, subject: `[Cyprus Winter] New tasting request: ${guestName} | ${date}`, html: `<h2>New booking request from Cyprus Winter</h2><p>A guest has requested a tasting at <strong>${providerName}</strong>.</p><ul><li><strong>Guest:</strong> ${guestName}</li><li><strong>Email:</strong> ${guestEmail}</li><li><strong>Date:</strong> ${date}</li><li><strong>Party size:</strong> ${partySize}</li><li><strong>Notes:</strong> ${notes}</li></ul><p>Please reply directly to the guest to confirm availability.</p><p>Cyprus Winter</p>` });
    if (error) console.error("Resend winery notification error:", error);
    return !error;
  } catch (err) { console.error("Winery notification send error:", err); return false; }
}

export async function sendBookingRequestToGuide(booking: Booking, guide: { name: string; partnerEmail: string }, trailName?: string): Promise<boolean> {
  if (!resend) return false;
  const guestName = escapeHtml(booking.guestName);
  const guestEmail = escapeHtml(booking.guestEmail);
  const providerName = escapeHtml(guide.name);
  const date = escapeHtml(booking.date);
  const partySize = String(booking.partySize);
  const notes = booking.notes ? escapeHtml(booking.notes) : "(none)";
  const trailLine = trailName ? `<li><strong>Trail:</strong> ${escapeHtml(trailName)}</li>` : "";
  try {
    const { error } = await resend.emails.send({ from, to: guide.partnerEmail, subject: `[Cyprus Winter] New guide request: ${guestName} | ${date}`, html: `<h2>New booking request from Cyprus Winter</h2><p>A guest has requested a guided hike with <strong>${providerName}</strong>.</p><ul><li><strong>Guest:</strong> ${guestName}</li><li><strong>Email:</strong> ${guestEmail}</li><li><strong>Date:</strong> ${date}</li><li><strong>Party size:</strong> ${partySize}</li>${trailLine}<li><strong>Notes:</strong> ${notes}</li></ul><p>Please reply directly to the guest to confirm availability.</p><p>Cyprus Winter</p>` });
    if (error) console.error("Resend guide notification error:", error);
    return !error;
  } catch (err) { console.error("Guide notification send error:", err); return false; }
}

function bookingLookupUrl(email: string): string {
  return `${SITE_URL}/bookings`;
}

export async function sendBookingLookupTokenEmail(email: string, token: string, localeInput?: string): Promise<boolean> {
  if (!resend) return false;
  const locale = resolveLocale(localeInput);
  const t = await getTranslations({ locale, namespace: "email" });
  const dir = emailDir(locale);
  const safeEmail = `<strong>${escapeHtml(email)}</strong>`;
  const lookupUrl = `${SITE_URL}/bookings?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  try {
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: t("lookup.subject"),
      html: `<div dir="${dir}"><h2>${escapeHtml(t("lookup.heading"))}</h2><p>${t("lookup.requestedFor", { email: safeEmail })}</p><p>${escapeHtml(t("lookup.useLink"))}</p><p><a href="${lookupUrl}">${escapeHtml(t("lookup.viewBookings"))}</a></p><p>${escapeHtml(t("lookup.ignore"))}</p></div>`,
    });
    if (error) console.error("Resend lookup token error:", error);
    return !error;
  } catch (err) { console.error("Lookup token email error:", err); return false; }
}
