import { describe, it, expect } from "vitest";
import { createBookingSchema } from "./booking-schema";

describe("createBookingSchema", () => {
  const valid = {
    type: "winery_tasting",
    providerId: "tsiakkas",
    date: "2099-03-15",
    idempotencyKey: "schema-test-booking-key-001",
    partySize: 2,
    guestEmail: "test@example.com",
    guestName: "Test Guest",
  };

  it("accepts valid input", () => {
    const result = createBookingSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects wrong type", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      type: "restaurant",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      date: "15-03-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects guestEmail over 254 chars", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      guestEmail: "a".repeat(250) + "@b.co",
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
  it("rejects empty providerId", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      providerId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects party size 0", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      partySize: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes over 500 chars", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects partySize over 20", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      partySize: 21,
    });
    expect(result.success).toBe(false);
  });

  it("rejects guestName over 200 chars", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      guestName: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional notes", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      notes: "Window seat please",
    });
    expect(result.success).toBe(true);
  });

});
