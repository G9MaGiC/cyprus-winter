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

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
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

import GuideBookingForm from "./GuideBookingForm";
import type { Guide } from "@/data/guides";

const guide: Guide = {
  id: "cyprus-active-tours",
  name: "Cyprus Active Tours",
  region: "Troodos & Paphos",
  district: "lemesos",
  languages: ["english", "greek"],
  description: "Winter hiking tours.",
  trailIds: ["artemis"],
  isVerified: true,
};

const messages = {
  book: {
    guideForm: {
      success: {
        title: "Request sent",
        body: "Your hike request for {guideName} is on its way.",
        tip: "Pack layers and water.",
        emailDelayed: "Email may be delayed.",
        crossDevicePrefix: "Saved in this browser — open",
        crossDeviceSuffix: "on another device with the same email.",
        ctaBookings: "My Bookings",
        ctaTrails: "Browse trails",
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
        date: { label: "Preferred date", hint: "Winter days are short" },
        trail: {
          label: "Trail",
          optional: "(optional)",
          hint: "Optional",
          placeholder: "Select a trail",
        },
        partySize: { label: "Group size", placeholder: "Select group size", plus: "11+" },
        guestName: { label: "Your name", placeholder: "Your name" },
        guestEmail: { label: "Email", placeholder: "you@example.com" },
        notes: {
          label: "Notes",
          optional: "(optional)",
          hint: "Fitness level",
          placeholder: "Optional",
          counter: "{count}/500",
        },
      },
      submit: {
        idle: "Request guided hike",
        sending: "Sending…",
        ariaIdle: "Request guided hike",
        ariaSending: "Sending your request",
      },
      finePrint: {
        bodyPrefix: "By submitting you agree to our",
        terms: "Terms",
        and: "and",
        privacy: "Privacy",
        bodySuffix: ".",
      },
    },
    form: {
      successUnverified:
        "We've saved your request under My bookings. To be sure of your date, also contact the {context} directly — no payment is taken in-app.",
      states: {
        heading: "Booking states:",
        guideBody: "Requested until guide confirms.",
        offlineQueue: "Offline requests queue automatically.",
      },
      trust: {
        aria: "Booking trust information",
        heading: "Before you submit",
        verifiedRoute: "Verified route.",
        emailConfirm: "Guide confirms by email.",
        noCharge: "No payment here.",
        contextPartner: "partner",
        contextGuide: "guide",
      },
      progress: {
        aria: "Booking progress",
        stepDetails: "Details",
        stepSent: "Request sent",
        stepConfirmation: "Guide confirms",
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

function renderForm(guideOverride?: Partial<Guide>) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <GuideBookingForm guide={{ ...guide, ...guideOverride }} />
    </NextIntlClientProvider>
  );
}

describe("GuideBookingForm", () => {
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
    expect(screen.getByLabelText("Preferred date")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Request guided hike" })).toBeTruthy();
    expect(screen.getByTestId("stepper").textContent).toContain("step-1");
  });

  it("shows an alert when submit fails", () => {
    bookingFormState.value.error = "Request failed";
    renderForm();
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Request failed");
  });

  it("shows success live region with email-delayed note when guide is verified", () => {
    bookingFormState.value.done = true;
    bookingFormState.value.emailDelayed = true;
    renderForm({ partnerEmail: "tours@cyprus-active.com" });
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Request sent");
    expect(status.textContent).toContain("Cyprus Active Tours");
    expect(status.textContent).toContain("Email may be delayed");
    // Step 3 ("Guide confirms") stays hollow while the request is pending (B2-04).
    expect(screen.getByTestId("stepper").textContent).toContain("step-2");
  });

  it("shows honest unverified success copy without email promises by default", () => {
    bookingFormState.value.done = true;
    bookingFormState.value.emailDelayed = true;
    renderForm();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Request sent");
    expect(status.textContent).toContain("contact the guide directly");
    expect(status.textContent).not.toContain("Email may be delayed");
    expect(screen.getByTestId("stepper").textContent).toContain("step-2");
  });
});
