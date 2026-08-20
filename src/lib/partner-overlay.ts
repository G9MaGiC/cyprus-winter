export type PartnerOverlay = {
  openingHours?: string;
  imageUrl?: string;
};

const overlays = new Map<string, PartnerOverlay>();

export function resetPartnerOverlaysForTests(): void {
  overlays.clear();
}

export function getPartnerOverlay(providerId: string): PartnerOverlay | undefined {
  return overlays.get(providerId);
}

/** Live winter hours from the partner overlay, if the partner set them. */
export function partnerOpeningHours(providerId: string): string | undefined {
  const hours = overlays.get(providerId)?.openingHours?.trim();
  return hours || undefined;
}

export function applyPartnerOpeningHours<T extends { id: string; openingHours?: string }>(place: T): T {
  const hours = partnerOpeningHours(place.id);
  if (!hours) return place;
  return { ...place, openingHours: hours };
}

export function setPartnerOverlay(providerId: string, patch: PartnerOverlay): PartnerOverlay {
  const current = overlays.get(providerId) ?? {};
  const next: PartnerOverlay = { ...current };
  if (typeof patch.openingHours === "string") {
    next.openingHours = patch.openingHours.trim().slice(0, 500);
  }
  if (typeof patch.imageUrl === "string") {
    next.imageUrl = patch.imageUrl.trim();
  }
  overlays.set(providerId, next);
  return next;
}
