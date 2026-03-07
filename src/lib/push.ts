/**
 * Web Push for opt-in reminders. Requires VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.
 * Generate: npx web-push generate-vapid-keys
 */
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

export function isPushConfigured(): boolean {
  return !!(publicKey && privateKey);
}

export function getVapidPublicKey(): string | null {
  return publicKey ?? null;
}

function ensureConfigured(): void {
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.");
  }
  const mailto = process.env.VAPID_MAILTO ?? "mailto:support@cypruswinter.com";
  webpush.setVapidDetails(mailto, publicKey, privateKey);
}

export type PushSubscriptionJson = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
};

export type SendPushResult = { ok: true } | { ok: false; expired?: boolean };

export async function sendPush(
  subscription: PushSubscriptionJson,
  payload: { title: string; body: string; url?: string }
): Promise<SendPushResult> {
  ensureConfigured();
  try {
    await webpush.sendNotification(subscription as webpush.PushSubscription, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    const statusCode = err && typeof err === "object" && "statusCode" in err ? (err as { statusCode?: number }).statusCode : 0;
    const expired = statusCode === 410 || statusCode === 404;
    if (expired) {
      console.warn("Push subscription expired (410/404):", statusCode);
    } else {
      console.error("Push send error:", err);
    }
    return { ok: false, expired };
  }
}
