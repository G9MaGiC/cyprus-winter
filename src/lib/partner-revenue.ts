/**
 * Partner revenue share: compute billable amounts from bookings.
 * Winery partners with partnerLeadFeeEur pay per lead/booking.
 */
import { getSupabase } from "./supabase";

const PAGE_SIZE = 1000;

export type PartnerRevenueSummary = {
  providerId: string;
  providerName: string;
  bookingCount: number;
  totalFeeEur: number;
};

export async function getPartnerRevenueThisMonth(): Promise<{
  totalRevenueEur: number;
  byPartner: PartnerRevenueSummary[];
}> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return getPartnerRevenueSince(start);
}

export async function getPartnerRevenueSince(start: Date): Promise<{
  totalRevenueEur: number;
  byPartner: PartnerRevenueSummary[];
}> {
  return getPartnerRevenueInRange(start);
}

export async function getPartnerRevenueInRange(start: Date, end?: Date): Promise<{
  totalRevenueEur: number;
  byPartner: PartnerRevenueSummary[];
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { totalRevenueEur: 0, byPartner: [] };
  }

  const startIso = start.toISOString();
  const endIso = end?.toISOString();

  const byPartner = new Map<string, PartnerRevenueSummary>();
  let totalRevenueEur = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from("bookings")
      .select("provider_id, provider_name, lead_fee_eur")
      .gte("created_at", startIso)
      .not("lead_fee_eur", "is", null)
      .range(offset, offset + PAGE_SIZE - 1);
    if (endIso) query = query.lt("created_at", endIso);
    const { data, error } = await query;

    if (error) {
      console.error("Partner revenue query error:", error);
      return { totalRevenueEur: 0, byPartner: [] };
    }

    for (const row of data ?? []) {
      const fee = Number(row.lead_fee_eur) || 0;
      if (fee <= 0) continue;

      totalRevenueEur += fee;
      const id = String(row.provider_id);
      const existing = byPartner.get(id);
      if (existing) {
        existing.bookingCount += 1;
        existing.totalFeeEur += fee;
      } else {
        byPartner.set(id, {
          providerId: id,
          providerName: String(row.provider_name),
          bookingCount: 1,
          totalFeeEur: fee,
        });
      }
    }

    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return {
    totalRevenueEur,
    byPartner: Array.from(byPartner.values()),
  };
}
