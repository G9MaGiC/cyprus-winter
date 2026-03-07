import { getVapidPublicKey, isPushConfigured } from "@/lib/push";

export async function GET() {
  if (!isPushConfigured()) {
    return Response.json({ error: "Push not configured" }, { status: 503 });
  }
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return Response.json({ error: "VAPID key missing" }, { status: 503 });
  }
  return Response.json({ publicKey });
}
