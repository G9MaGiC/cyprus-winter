import { isBookingLookupTokenConfigured } from "./booking-lookup-token";

/**
 * Production environment checks for health endpoint and deploy runbooks.
 */

export type EnvCheck = {
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  hint?: string;
};

export function getProductionEnvChecks(): EnvCheck[] {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return [];

  const hasUpstash = !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  const hasSupabase = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const hasAi = !!(
    process.env.AI_GATEWAY_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OLLAMA_BASE_URL ||
    process.env.MOONSHOT_API_KEY ||
    process.env.OPENAI_API_KEY
  );

  return [
    {
      id: "upstash",
      label: "Upstash Redis (rate limits)",
      ok: hasUpstash,
      required: true,
      hint: "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
    },
    {
      id: "supabase",
      label: "Supabase (bookings, analytics, trail reports)",
      ok: hasSupabase,
      required: true,
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    },
    {
      id: "resend",
      label: "Resend (booking emails)",
      ok: !!process.env.RESEND_API_KEY,
      required: false,
      hint: "Set RESEND_API_KEY for confirmation emails",
    },
    {
      id: "ai",
      label: "AI provider (Cyprus Guide)",
      ok: hasAi,
      required: false,
      hint: "Set GROQ_API_KEY, AI_GATEWAY_API_KEY, or another provider",
    },
    {
      id: "admin",
      label: "Admin stats secret",
      ok: !!process.env.ADMIN_SECRET,
      required: false,
      hint: "Set ADMIN_SECRET for /admin/stats",
    },
    {
      id: "booking-lookup-token",
      label: "Booking lookup token secret",
      ok: isBookingLookupTokenConfigured(),
      required: false,
      hint: "Set BOOKING_LOOKUP_TOKEN_SECRET (min 16 chars) to email signed My Bookings links",
    },
  ];
}

export function productionEnvReady(): boolean {
  const checks = getProductionEnvChecks();
  return checks.filter((c) => c.required).every((c) => c.ok);
}

/** Annex / health JSON: booleans only — never include hints or env values. */
export type AnnexEnvCheck = Pick<EnvCheck, "id" | "label" | "ok" | "required">;

export function toAnnexProductionChecks(checks: EnvCheck[]): AnnexEnvCheck[] {
  return checks.map(({ id, label, ok, required }) => ({ id, label, ok, required }));
}
