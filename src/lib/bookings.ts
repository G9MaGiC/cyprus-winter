/**
 * Booking types and store. Uses Supabase when configured, else in-memory (dev fallback).
 */
import { createHash } from "node:crypto";
import { getSupabase, hasSupabase } from "./supabase";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type BookingType = "winery_tasting" | "guide_tour";

export type Booking = {
  id: string;
  type: BookingType;
  providerId: string;
  providerName: string;
  date: string;
  partySize: number;
  guestEmail: string;
  guestName: string;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
  /** Chosen trail for guide tours (AUD-86). Persisted as `trail_id` since
      migration 008; legacy DB rows may omit it and the client's field-wise
      merge keeps the locally stored value for those. */
  trailId?: string;
  /** Guest UI locale at booking time (migration 008); guest-facing status
      emails render in it. Absent on legacy rows — senders fall back to the
      default locale. */
  locale?: string;
};

const memoryStore: Booking[] = [];


export class BookingIdempotencyConflictError extends Error {
  constructor() {
    super("The idempotency key was already used for a different booking request.");
    this.name = "BookingIdempotencyConflictError";
  }
}

function idForIdempotencyKey(key: string, email: string): string {
  const digest = createHash("sha256").update(`${email}\0${key}`).digest("hex");
  return `b-idem-${digest}`;
}

function matchesBookingRequest(
  existing: Booking,
  input: Omit<Booking, "id" | "status" | "createdAt">,
  normalizedEmail: string
): boolean {
  return (
    existing.type === input.type &&
    existing.providerId === input.providerId &&
    existing.providerName === input.providerName &&
    existing.date === input.date &&
    existing.partySize === input.partySize &&
    existing.guestEmail === normalizedEmail &&
    existing.guestName === input.guestName &&
    (existing.notes ?? undefined) === (input.notes ?? undefined)
  );
}

function replayOrThrow(
  existing: Booking,
  input: Omit<Booking, "id" | "status" | "createdAt">,
  normalizedEmail: string
): CreateBookingResult {
  if (!matchesBookingRequest(existing, input, normalizedEmail)) {
    throw new BookingIdempotencyConflictError();
  }
  return { booking: existing, created: false };
}

export type CreateBookingInput = Omit<Booking, "id" | "status" | "createdAt"> & {
  leadFeeEur?: number;
  idempotencyKey: string;
};

export type CreateBookingResult = {
  booking: Booking;
  created: boolean;
};

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const { leadFeeEur, idempotencyKey, ...rest } = input;
  const guestEmailNormalized = input.guestEmail.trim().toLowerCase();
  const id = idForIdempotencyKey(idempotencyKey, guestEmailNormalized);
  const createdAt = new Date().toISOString();
  const booking: Booking = {
    ...rest,
    guestEmail: guestEmailNormalized,
    id,
    status: "pending",
    createdAt,
  };

  const supabase = getSupabase();
  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Booking idempotency lookup failed:", lookupError.message, { id });
      throw new Error(lookupError.message);
    }
    if (existing) {
      return replayOrThrow(rowToBooking(existing as Record<string, unknown>), rest, guestEmailNormalized);
    }

    const { error } = await supabase.from("bookings").insert({
      id,
      type: input.type,
      provider_id: input.providerId,
      provider_name: input.providerName,
      date: input.date,
      party_size: input.partySize,
      guest_email: guestEmailNormalized,
      guest_name: input.guestName,
      status: "pending",
      notes: input.notes ?? null,
      created_at: createdAt,
      lead_fee_eur: leadFeeEur ?? null,
      locale: input.locale ?? null,
      trail_id: input.trailId ?? null,
    });
    if (error) {
      // Two concurrent requests can both miss the lookup; the primary-key conflict
      // is the durable idempotency barrier.
      if (error.code === "23505") {
        const { data: replayed } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (replayed) {
          return replayOrThrow(rowToBooking(replayed as Record<string, unknown>), rest, guestEmailNormalized);
        }
      }
      console.error("Booking DB insert failed:", error.message, { id, providerId: input.providerId });
      throw new Error(error.message);
    }
    return { booking, created: true };
  }

  const existing = memoryStore.find((item) => item.id === id);
  if (existing) return replayOrThrow(existing, rest, guestEmailNormalized);
  memoryStore.push(booking);
  return { booking, created: true };
}

export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const supabase = getSupabase();
  if (supabase) {
    const emailNormalized = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("bookings")
      .select("id,type,provider_id,provider_name,date,party_size,guest_email,guest_name,status,created_at,notes,trail_id,locale")
      .eq("guest_email", emailNormalized)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToBooking(row as Record<string, unknown>));
  }

  return memoryStore
    .filter((b) => b.guestEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function getBookingsByProviderId(providerId: string): Promise<Booking[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id,type,provider_id,provider_name,date,party_size,guest_email,guest_name,status,created_at,notes,trail_id,locale")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToBooking(row as Record<string, unknown>));
  }

  return memoryStore
    .filter((b) => b.providerId === providerId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

/**
 * Booking status is a finite-state machine, not a free string:
 *   pending   -> confirmed | cancelled
 *   confirmed -> cancelled
 *   cancelled -> (terminal)
 * Same-status updates are idempotent no-ops (safe retries); everything else
 * is invalid_transition. The Supabase update is compare-and-set on the
 * status read, so two concurrent partner updates cannot both win.
 */
const ALLOWED_STATUS_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled"],
  cancelled: [],
};

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  providerId: string
): Promise<
  | { booking: Booking; changed: boolean }
  | { error: "not_found" | "forbidden" | "invalid_transition" | "conflict" }
> {
  if (status !== "confirmed" && status !== "cancelled") {
    return { error: "not_found" };
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!existing) return { error: "not_found" };
    const current = rowToBooking(existing as Record<string, unknown>);
    if (current.providerId !== providerId) return { error: "forbidden" };
    // `changed: false` on the idempotent no-op lets callers skip side effects
    // (the guest status email) on a safe retry of the same update.
    if (current.status === status) return { booking: current, changed: false };
    if (!ALLOWED_STATUS_TRANSITIONS[current.status]?.includes(status)) {
      return { error: "invalid_transition" };
    }
    const { data: updated, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .eq("provider_id", providerId)
      .eq("status", current.status)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    // CAS miss: the row changed between read and write (concurrent update).
    if (!updated) return { error: "conflict" };
    return { booking: rowToBooking(updated as Record<string, unknown>), changed: true };
  }

  const current = memoryStore.find((b) => b.id === id);
  if (!current) return { error: "not_found" };
  if (current.providerId !== providerId) return { error: "forbidden" };
  if (current.status === status) return { booking: current, changed: false };
  if (!ALLOWED_STATUS_TRANSITIONS[current.status]?.includes(status)) {
    return { error: "invalid_transition" };
  }
  current.status = status;
  return { booking: current, changed: true };
}

/**
 * Guest-initiated cancellation. Authorization is possession of the booking id
 * PLUS the exact guest email it was created with (the same proof the email
 * lookup uses) — and an email mismatch answers `not_found`, indistinguishable
 * from a missing booking, so ids cannot be probed for existence. Same FSM,
 * idempotent no-op, and compare-and-set semantics as updateBookingStatus.
 */
export async function cancelBookingAsGuest(
  id: string,
  guestEmail: string
): Promise<
  | { booking: Booking; changed: boolean }
  | { error: "not_found" | "invalid_transition" | "conflict" }
> {
  const normalized = guestEmail.trim().toLowerCase();

  const supabase = getSupabase();
  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!existing) return { error: "not_found" };
    const current = rowToBooking(existing as Record<string, unknown>);
    if (current.guestEmail !== normalized) return { error: "not_found" };
    if (current.status === "cancelled") return { booking: current, changed: false };
    if (!ALLOWED_STATUS_TRANSITIONS[current.status]?.includes("cancelled")) {
      return { error: "invalid_transition" };
    }
    const { data: updated, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", current.status)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) return { error: "conflict" };
    return { booking: rowToBooking(updated as Record<string, unknown>), changed: true };
  }

  const current = memoryStore.find((b) => b.id === id);
  if (!current) return { error: "not_found" };
  if (current.guestEmail !== normalized) return { error: "not_found" };
  if (current.status === "cancelled") return { booking: current, changed: false };
  if (!ALLOWED_STATUS_TRANSITIONS[current.status]?.includes("cancelled")) {
    return { error: "invalid_transition" };
  }
  current.status = "cancelled";
  return { booking: current, changed: true };
}

function rowToBooking(row: Record<string, unknown>): Booking {
  const type = row.type === "guide_tour" ? "guide_tour" : "winery_tasting";
  return {
    id: String(row.id),
    type,
    providerId: String(row.provider_id),
    providerName: String(row.provider_name),
    date: String(row.date),
    partySize: Number(row.party_size),
    guestEmail: String(row.guest_email),
    guestName: String(row.guest_name),
    status: (row.status as BookingStatus) ?? "pending",
    createdAt: String(row.created_at),
    notes: row.notes ? String(row.notes) : undefined,
    trailId: row.trail_id ? String(row.trail_id) : undefined,
    locale: row.locale ? String(row.locale) : undefined,
  };
}

export async function getBookingsCountThisMonth(): Promise<number> {
  return getBookingsCountSince(getMonthStart());
}

function getMonthStart(): Date {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function getBookingsCountSince(start: Date): Promise<number> {
  return getBookingsCountInRange(start);
}

export async function getBookingsCountInRange(start: Date, end?: Date): Promise<number> {
  const supabase = getSupabase();
  const startIso = start.toISOString();
  const endIso = end?.toISOString();
  if (supabase) {
    let query = supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startIso);
    if (endIso) query = query.lt("created_at", endIso);
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  }

  const windowStart = start.getTime();
  const windowEnd = end?.getTime();
  return memoryStore.filter((b) => {
    const created = new Date(b.createdAt).getTime();
    if (created < windowStart) return false;
    if (typeof windowEnd === "number" && created >= windowEnd) return false;
    return true;
  }).length;
}

export const useDb = hasSupabase;
