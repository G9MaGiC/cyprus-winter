/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

const bookingFormState = vi.hoisted(() => ({
  value: {
    loading: false,
    done: false,
    storageMode: "local" as "local" | "memory",
    emailDelayed: false,
    error: null as string | null,
    fieldErrors: {} as Record<string, string>,
    notesLength: 0,
    retryAfterSeconds: 0,
    setNotesLength: vi.fn(),
    successRef: { current: null } as React.RefObject<HTMLDivElement | null>,
    errorRef: { current: null } as React.RefObject<HTMLParagraphElement | null>,
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    todayStr: "2026-08-21",
    validateFieldOnBlur: vi.fn(),
  },
}));

vi.mock("@/hooks/useBookingForm", () => ({
  useBookingForm: () => bookingFormState.value,
}));

vi.mock("@/components/bookings/BookingProgressStepper", () => ({
  default: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="stepper">step-{currentStep}</div>
  ),
}));

vi.mock("@/components/bookings/BookingTrustStrip", () => ({
  default: () => <div data-testid="trust-strip" />,
}));

vi.mock("@/components/bookings/BookingSuccessNextSteps", () => ({
  default: () => <div data-testid="next-steps" />,
}));

vi.mock("@/components/bookings/WineryBookingHints", () => ({
  default: () => <div data-testid="hints" />,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

import WineryBookingForm from "./WineryBookingForm";

const messages = {
  book: {
    wineryForm: {
      success: {
        title: "Request sent",
        body: "Your tasting request for {wineryName} is on its way.",
        tip: "They confirm by email.",
        emailDelayed: "Email may be delayed.",
        crossDevicePrefix: "Saved in this browser — open",
        crossDeviceSuffix: "on another device with the same email.",
        ctaBookings: "My Bookings",
        ctaDiscover: "Discover more",
      },
      errors: {
        failed: "Request failed",
        fallback: "Try again",
        offlineQueued: "Queued",
        offlineDropped: "Dropped",
      },
      validation: {
        dateRequired: "Pick a date",
        nameRequired: "Name required",
        emailInvalid: "Email invalid",
        partySizeRequired: "Party size required",
      },
      fields: {
        date: { label: "Date", hint: "Winter weekends fill" },
        partySize: { label: "Party size", placeholder: "Select group size", plus: "11+" },
        guestName: { label: "Name", placeholder: "Your name" },
        guestEmail: { label: "Email", placeholder: "you@example.com" },
        notes: { label: "Notes", placeholder: "Optional", counter: "{count}/500" },
      },
      submit: {
        idle: "Send request",
        sending: "Sending…",
        ariaIdle: "Send tasting request",
        ariaSending: "Sending tasting request",
      },
      finePrint: {
        bodyPrefix: "By submitting you agree to our",
        terms: "Terms",
        and: "and",
        privacy: "Privacy",
        bodySuffix: ".",
      },
      legal: {
        bodyPrefix: "By submitting you agree to our",
        terms: "Terms",
        and: "and",
        privacy: "Privacy",
      },
    },
    form: {
      successUnverified:
        "We've saved your request under My bookings. To be sure of your date, also contact the {context} directly — no payment is taken in-app.",
      states: {
        heading: "Booking states:",
        wineryBody: "Requested until partner confirms.",
        offlineQueue: "Offline requests queue automatically.",
      },
      trust: {
        aria: "Booking trust information",
        heading: "Before you submit",
        verifiedRoute: "Verified route.",
        emailConfirm: "Partner confirms by email.",
        noCharge: "No payment here.",
        contextPartner: "partner",
        contextGuide: "guide",
      },
      progress: {
        aria: "Booking progress",
        stepDetails: "Details",
        stepSent: "Request sent",
        stepConfirmation: "Partner confirms",
      },
    },
  },
  bookings: { title: "My Bookings" },
  errors: {
    api: {
      VALIDATION_ERROR: "Check the form fields.",
      BAD_REQUEST: "Something in the request was off.",
      RATE_LIMITED: "Too many requests.",
      SERVICE_UNAVAILABLE: "Service unavailable.",
      SERVER_ERROR: "Server error.",
      NOT_FOUND: "Not found.",
      IDEMPOTENCY_CONFLICT: "Already submitted.",
    },
    rateLimited: {
      waitThenRetry:
        "{seconds, plural, one {Wait # second, then try again.} other {Wait # seconds, then try again.}}",
    },
  },
  common: {
    viewPlan: "View plan",
    peopleCount: "{count, plural, one {# person} other {# people}}",
  },
};

function renderForm(props?: { partnerVerified?: boolean }) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <WineryBookingForm wineryId="tsiakkas" wineryName="Tsiakkas Winery" {...props} />
    </NextIntlClientProvider>
  );
}

describe("WineryBookingForm", () => {
  beforeEach(() => {
    bookingFormState.value = {
      ...bookingFormState.value,
      loading: false,
      done: false,
      storageMode: "local",
      emailDelayed: false,
      error: null,
      fieldErrors: {},
      todayStr: "2026-08-21",
      successRef: { current: null },
      errorRef: { current: null },
      handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
      validateFieldOnBlur: vi.fn(),
      setNotesLength: vi.fn(),
      notesLength: 0,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the request form with trust strip and date field", () => {
    renderForm();
    expect(screen.getByTestId("trust-strip")).toBeTruthy();
    expect(screen.getByLabelText("Date")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send tasting request" })).toBeTruthy();
    expect(screen.getByTestId("stepper").textContent).toContain("step-1");
  });

  it("shows an alert when submit fails", () => {
    bookingFormState.value.error = "Request failed";
    renderForm();
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Request failed");
  });

  it("shows success live region with email-delayed note when partner is verified", () => {
    bookingFormState.value.done = true;
    bookingFormState.value.emailDelayed = true;
    renderForm({ partnerVerified: true });
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Request sent");
    expect(status.textContent).toContain("Tsiakkas Winery");
    expect(status.textContent).toContain("Email may be delayed");
    // Step 3 ("Partner confirms") stays hollow while the request is pending (B2-04).
    expect(screen.getByTestId("stepper").textContent).toContain("step-2");
  });

  it("shows honest unverified success copy without email promises by default", () => {
    bookingFormState.value.done = true;
    bookingFormState.value.emailDelayed = true;
    renderForm();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Request sent");
    expect(status.textContent).toContain("contact the partner directly");
    expect(status.textContent).not.toContain("Email may be delayed");
    expect(screen.queryByTestId("next-steps")).toBeNull();
    expect(screen.getByTestId("stepper").textContent).toContain("step-2");
  });
});
