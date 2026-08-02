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
};

const memoryStore: Booking[] = [];


function idForIdempotencyKey(key: string): string {
  const digest = createHash("sha256").update(key).digest("hex");
  return `b-idem-${digest}`;
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
  const id = idForIdempotencyKey(idempotencyKey);
  const createdAt = new Date().toISOString();
  const guestEmailNormalized = input.guestEmail.trim().toLowerCase();
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
      return { booking: rowToBooking(existing as Record<string, unknown>), created: false };
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
          return { booking: rowToBooking(replayed as Record<string, unknown>), created: false };
        }
      }
      console.error("Booking DB insert failed:", error.message, { id, providerId: input.providerId });
      throw new Error(error.message);
    }
    return { booking, created: true };
  }

  const existing = memoryStore.find((item) => item.id === id);
  if (existing) return { booking: existing, created: false };
  memoryStore.push(booking);
  return { booking, created: true };
}

export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const supabase = getSupabase();
  if (supabase) {
    const emailNormalized = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("bookings")
      .select("id,type,provider_id,provider_name,date,party_size,guest_email,guest_name,status,created_at,notes")
      .eq("guest_email", emailNormalized)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToBooking(row as Record<string, unknown>));
  }

  return memoryStore
    .filter((b) => b.guestEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
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
