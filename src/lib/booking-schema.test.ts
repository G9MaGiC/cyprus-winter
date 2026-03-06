import { describe, it, expect } from "vitest";
import { createBookingSchema } from "./booking-schema";

describe("createBookingSchema", () => {
  const valid = {
    type: "winery_tasting",
    providerId: "tsiakkas",
    date: "2026-03-15",
    partySize: 2,
    guestEmail: "test@example.com",
    guestName: "Test Guest",
  };

  it("accepts valid input", () => {
    const result = createBookingSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      date: "15-03-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      guestEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects party size out of range", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      partySize: 25,
    });
    expect(result.success).toBe(false);
  });
});
