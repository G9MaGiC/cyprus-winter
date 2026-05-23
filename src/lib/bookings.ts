/**
 * Booking types and store. Uses Supabase when configured, else in-memory (dev fallback).
 */
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

function generateId(): string {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type CreateBookingInput = Omit<Booking, "id" | "status" | "createdAt"> & {
  leadFeeEur?: number;
};

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { leadFeeEur, ...rest } = input;
  const id = generateId();
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
      console.error("Booking DB insert failed:", error.message, { id, providerId: input.providerId });
      throw new Error(error.message);
    }
    return booking;
  }

  memoryStore.push(booking);
  return booking;
}

export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const supabase = getSupabase();
  if (supabase) {
    const emailNormalized = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("guest_email", emailNormalized)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToBooking);
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
