import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";

export type PartnerIdentity = {
  providerId: string;
  providerName: string;
  kind: "winery" | "guide";
  email: string;
};

export function findVerifiedPartnerByEmail(email: string): PartnerIdentity | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const winery = wineries.find(
    (w) => w.isVerified && w.partnerEmail?.trim().toLowerCase() === normalized
  );
  if (winery) {
    return {
      providerId: winery.id,
      providerName: winery.name,
      kind: "winery",
      email: normalized,
    };
  }

  const guide = guides.find(
    (g) => g.isVerified && g.partnerEmail?.trim().toLowerCase() === normalized
  );
  if (guide) {
    return {
      providerId: guide.id,
      providerName: guide.name,
      kind: "guide",
      email: normalized,
    };
  }

  return null;
}
