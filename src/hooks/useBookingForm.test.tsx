// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { wineryBookingSchema } from "@/lib/booking-schemas";
import { useBookingForm } from "./useBookingForm";

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

vi.mock("@/lib/offline-queue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/offline-queue")>();
  return { ...actual, addMutation: vi.fn() };
});

import { addMutation } from "@/lib/offline-queue";

function useTestBookingForm() {
  return useBookingForm(
    {
      type: "winery_tasting",
      providerId: "tsiakkas",
      providerName: "Tsiakkas Winery",
      schema: wineryBookingSchema,
      errorFields: ["date", "partySize", "guestName", "guestEmail"],
    },
    {
      failed: "Failed",
      fallback: "Try again",
      offlineQueued: "Queued",
      offlineDropped: "Dropped",
      serverField: "Check this field",
    }
  );
}

// A minimal real form: the server-field mapping needs an actual <form> so
// FormData and elements.namedItem() work (AUD-80).
function ServerErrorForm() {
  const { handleSubmit, fieldErrors, error, validateFieldOnBlur } = useTestBookingForm();
  return (
    <form onSubmit={handleSubmit}>
      <input name="date" defaultValue="2099-03-15" />
      <input name="partySize" defaultValue="2" />
      <input name="guestName" defaultValue="Test Guest" />
      <input
        name="guestEmail"
        data-testid="email"
        defaultValue="test@example.com"
        onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)}
      />
      <textarea name="notes" defaultValue="" />
      <p data-testid="emailFieldError">{fieldErrors.guestEmail ?? ""}</p>
      <p data-testid="notesFieldError">{fieldErrors.notes ?? ""}</p>
      <p data-testid="banner">{error ?? ""}</p>
      <button type="submit">Submit</button>
    </form>
  );
}

function mockFetch400(details: unknown) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 400,
    headers: { get: () => null },
    json: async () => ({ error: { code: "VALIDATION_ERROR", details } }),
  });
}

function BookingDateInput() {
  const { todayStr } = useTestBookingForm();
  return <input type="date" min={todayStr} />;
}

function IntlWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={{}}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useBookingForm", () => {
  const originalTimeZone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "America/New_York";
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    process.env.TZ = originalTimeZone;
  });

  it("uses the local calendar date for the minimum booking date", () => {
    vi.setSystemTime(new Date("2026-07-15T01:30:00.000Z"));

    const { result } = renderHook(useTestBookingForm, { wrapper: IntlWrapper });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(result.current.todayStr).toBe("2026-07-14");
  });

  it("hydrates the minimum date from the browser timezone", async () => {
    vi.setSystemTime(new Date("2026-07-15T01:30:00.000Z"));
    process.env.TZ = "UTC";
    const serverHtml = renderToString(
      <IntlWrapper>
        <BookingDateInput />
      </IntlWrapper>
    );

    expect(serverHtml).toContain('min=""');

    process.env.TZ = "America/New_York";
    const container = document.createElement("div");
    container.innerHTML = serverHtml;

    const root = hydrateRoot(
      container,
      <IntlWrapper>
        <BookingDateInput />
      </IntlWrapper>
    );
    await act(async () => {});

    expect(container.querySelector("input")?.min).toBe("2026-07-14");

    root.unmount();
  });

  it("maps a server-named field into fieldErrors and focuses its input (AUD-80)", async () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal("fetch", mockFetch400([{ field: "guestEmail", message: "Invalid email" }]));

    const { getByTestId, container } = render(<ServerErrorForm />, { wrapper: IntlWrapper });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(getByTestId("emailFieldError").textContent).toBe("Check this field");
    expect(getByTestId("banner").textContent).toBe("Failed");
    expect(document.activeElement).toBe(getByTestId("email"));
  });

  it("ignores a server field the form does not render (AUD-80)", async () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal("fetch", mockFetch400([{ field: "providerId", message: "Unknown provider" }]));

    const { getByTestId, container } = render(<ServerErrorForm />, { wrapper: IntlWrapper });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(getByTestId("emailFieldError").textContent).toBe("");
    expect(getByTestId("banner").textContent).toBe("Failed");
    expect(document.activeElement).not.toBe(getByTestId("email"));
  });

  it("keeps the server-named error on blur while the value is unchanged (review finding)", async () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    // The server is stricter than the client schema, so the same value passes
    // client Zod — the exact condition that used to wipe the marker on blur.
    vi.stubGlobal("fetch", mockFetch400([{ field: "guestEmail", message: "Too long" }]));

    const { getByTestId, container } = render(<ServerErrorForm />, { wrapper: IntlWrapper });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    expect(getByTestId("emailFieldError").textContent).toBe("Check this field");

    await act(async () => {
      fireEvent.blur(getByTestId("email"));
    });
    expect(getByTestId("emailFieldError").textContent).toBe("Check this field");

    await act(async () => {
      fireEvent.change(getByTestId("email"), { target: { value: "new@example.com" } });
      fireEvent.blur(getByTestId("email"));
    });
    expect(getByTestId("emailFieldError").textContent).toBe("");
  });

  it("treats request-only fields as banner-only — no mark, no focus (review finding)", async () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    // "notes" is a request field but renders no inline error node, so a
    // server detail naming it must not steal focus into an unmarked textarea.
    vi.stubGlobal("fetch", mockFetch400([{ field: "notes", message: "Too long" }]));

    const { getByTestId, container } = render(<ServerErrorForm />, { wrapper: IntlWrapper });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(getByTestId("notesFieldError").textContent).toBe("");
    expect(getByTestId("banner").textContent).toBe("Failed");
    expect(document.activeElement).not.toBe(container.querySelector("textarea"));
  });

  it("queues a WebKit network failure offline (TypeError, not message text)", async () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Load failed")));

    const { getByTestId, container } = render(<ServerErrorForm />, { wrapper: IntlWrapper });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });

    expect(getByTestId("banner").textContent).toBe("Queued");
    expect(vi.mocked(addMutation)).toHaveBeenCalledTimes(1);
  });

  it("never surfaces a raw runtime message — a non-JSON gateway error falls back localized", async () => {
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: { get: () => null },
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON at position 0");
        },
      })
    );

    const { getByTestId, container } = render(<ServerErrorForm />, { wrapper: IntlWrapper });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(getByTestId("banner").textContent).toBe("Try again");
    expect(vi.mocked(addMutation)).not.toHaveBeenCalled();
  });
});
