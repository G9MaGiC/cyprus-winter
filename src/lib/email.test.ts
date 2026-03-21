import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: { send: mockSend },
  })),
}));

vi.mock("./site-url", () => ({
  SITE_URL: "https://test.cypruswinter.com",
}));

// Set env before importing the module
process.env.RESEND_API_KEY = "test-key";

import {
  sendBookingConfirmation,
  sendBookingRequestToWinery,
  sendBookingRequestToGuide,
} from "./email";
import type { Booking } from "./bookings";

const baseBooking: Booking = {
  id: "b-1",
  type: "winery_tasting",
  providerId: "w-1",
  providerName: "Vouni Panayia",
  date: "2026-03-25",
  partySize: 4,
  guestEmail: "guest@example.com",
  guestName: "John Doe",
  status: "pending",
  createdAt: "2026-03-20T10:00:00Z",
};

describe("sendBookingConfirmation", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("sends email and returns true on success", async () => {
    mockSend.mockResolvedValue({ error: null });
    const result = await sendBookingConfirmation(baseBooking);
    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toBe("guest@example.com");
    expect(call.subject).toContain("Vouni Panayia");
    expect(call.html).toContain("John Doe");
    expect(call.html).toContain("tasting");
  });

  it("uses 'guided hike' label for guide_tour type", async () => {
    mockSend.mockResolvedValue({ error: null });
    await sendBookingConfirmation({ ...baseBooking, type: "guide_tour" });
    const call = mockSend.mock.calls[0][0];
    expect(call.html).toContain("guided hike");
    expect(call.html).toContain("the guide");
  });

  it("returns false on Resend API error", async () => {
    mockSend.mockResolvedValue({ error: { message: "bad request" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await sendBookingConfirmation(baseBooking);
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });

  it("returns false on exception", async () => {
    mockSend.mockRejectedValue(new Error("network"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await sendBookingConfirmation(baseBooking);
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });

  it("escapes HTML in guest name", async () => {
    mockSend.mockResolvedValue({ error: null });
    await sendBookingConfirmation({ ...baseBooking, guestName: '<script>alert("xss")</script>' });
    const call = mockSend.mock.calls[0][0];
    expect(call.html).not.toContain("<script>");
    expect(call.html).toContain("&lt;script&gt;");
  });
});

describe("sendBookingRequestToWinery", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("sends email to winery partner and returns true", async () => {
    mockSend.mockResolvedValue({ error: null });
    const result = await sendBookingRequestToWinery(baseBooking, {
      name: "Vouni Panayia",
      partnerEmail: "winery@example.com",
    });
    expect(result).toBe(true);
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toBe("winery@example.com");
    expect(call.subject).toContain("New tasting request");
  });

  it("shows (none) when notes are absent", async () => {
    mockSend.mockResolvedValue({ error: null });
    await sendBookingRequestToWinery(baseBooking, {
      name: "W",
      partnerEmail: "w@e.com",
    });
    const call = mockSend.mock.calls[0][0];
    expect(call.html).toContain("(none)");
  });

  it("shows notes when present", async () => {
    mockSend.mockResolvedValue({ error: null });
    await sendBookingRequestToWinery(
      { ...baseBooking, notes: "Interested in reds" },
      { name: "W", partnerEmail: "w@e.com" }
    );
    const call = mockSend.mock.calls[0][0];
    expect(call.html).toContain("Interested in reds");
  });

  it("returns false on error", async () => {
    mockSend.mockResolvedValue({ error: { message: "fail" } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await sendBookingRequestToWinery(baseBooking, {
      name: "W",
      partnerEmail: "w@e.com",
    });
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe("sendBookingRequestToGuide", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("sends email to guide and returns true", async () => {
    mockSend.mockResolvedValue({ error: null });
    const result = await sendBookingRequestToGuide(
      { ...baseBooking, type: "guide_tour" },
      { name: "Nikos", partnerEmail: "nikos@example.com" },
      "Artemis Trail"
    );
    expect(result).toBe(true);
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toBe("nikos@example.com");
    expect(call.subject).toContain("New guide request");
    expect(call.html).toContain("Artemis Trail");
  });

  it("omits trail line when trailName is not provided", async () => {
    mockSend.mockResolvedValue({ error: null });
    await sendBookingRequestToGuide(
      { ...baseBooking, type: "guide_tour" },
      { name: "Nikos", partnerEmail: "nikos@example.com" }
    );
    const call = mockSend.mock.calls[0][0];
    expect(call.html).not.toContain("Trail:");
  });

  it("returns false on exception", async () => {
    mockSend.mockRejectedValue(new Error("timeout"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await sendBookingRequestToGuide(
      baseBooking,
      { name: "N", partnerEmail: "n@e.com" }
    );
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });
});
