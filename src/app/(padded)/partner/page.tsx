"use client";

import { useCallback, useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { LAYOUT, SECTION, SKELETON, TYPE, CTA } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type PartnerIdentity = {
  providerId: string;
  providerName: string;
  kind: "winery" | "guide";
  email: string;
};

type PartnerBooking = {
  id: string;
  type: string;
  providerId: string;
  date: string;
  partySize: number;
  guestEmail: string;
  guestName: string;
  status: "pending" | "confirmed" | "cancelled";
};

type PartnerOverlay = {
  openingHours?: string;
  imageUrl?: string;
};

export default function PartnerPortalPage() {
  const tNav = useTranslations("nav");
  const t = useTranslations("partner.portal");
  const [authenticated, setAuthenticated] = useState(false);
  const [partner, setPartner] = useState<PartnerIdentity | null>(null);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [hours, setHours] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPortal = useCallback(async () => {
    setLoadError(null);
    const [bookingsRes, profileRes] = await Promise.all([
      fetch("/api/partner/bookings", { credentials: "include" }),
      fetch("/api/partner/profile", { credentials: "include" }),
    ]);
    if (bookingsRes.status === 401 || profileRes.status === 401) {
      setAuthenticated(false);
      setPartner(null);
      return;
    }
    if (!bookingsRes.ok) {
      const body = (await bookingsRes.json().catch(() => null)) as { message?: string } | null;
      setLoadError(body?.message ?? String(bookingsRes.status));
      return;
    }
    const bookingJson = (await bookingsRes.json()) as { bookings?: PartnerBooking[] };
    setBookings(bookingJson.bookings ?? []);
    if (profileRes.ok) {
      const profileJson = (await profileRes.json()) as {
        partner?: PartnerIdentity;
        overlay?: PartnerOverlay;
      };
      if (profileJson.partner) setPartner(profileJson.partner);
      setHours(profileJson.overlay?.openingHours ?? "");
      setImageUrl(profileJson.overlay?.imageUrl ?? "");
    }
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    fetch("/api/partner/session", { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          return r.json().then((json: { partner?: PartnerIdentity }) => {
            if (json.partner) setPartner(json.partner);
            setAuthenticated(true);
            return loadPortal();
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, [loadPortal]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const secret = secretInput.trim();
    if (!email || !secret) return;
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/partner/session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, secret }),
      });
      if (!res.ok) {
        setAuthError("invalid");
        setLoading(false);
        return;
      }
      const json = (await res.json()) as { partner?: PartnerIdentity };
      if (json.partner) setPartner(json.partner);
      setEmailInput("");
      setSecretInput("");
      setAuthenticated(true);
      await loadPortal();
    } catch {
      setAuthError("invalid");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/partner/session", { method: "DELETE", credentials: "include" });
    setAuthenticated(false);
    setPartner(null);
    setBookings([]);
    setHours("");
    setImageUrl("");
  };

  const handleStatus = async (id: string, status: "confirmed" | "cancelled") => {
    setUpdatingId(id);
    setRequestError(null);
    try {
      const res = await fetch(`/api/partner/bookings/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) {
        setRequestError("failed");
        return;
      }
      const json = (await res.json()) as { booking: PartnerBooking };
      setBookings((current) => current.map((b) => (b.id === id ? json.booking : b)));
    } catch {
      setRequestError("failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      const body: { openingHours: string; imageUrl?: string } = { openingHours: hours };
      const trimmedImage = imageUrl.trim();
      if (trimmedImage) body.imageUrl = trimmedImage;
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) {
        setProfileError(res.status === 400 ? "unsafeImage" : "saveFailed");
        return;
      }
      const json = (await res.json()) as { overlay?: PartnerOverlay };
      setHours(json.overlay?.openingHours ?? hours);
      setImageUrl(json.overlay?.imageUrl ?? imageUrl);
      setProfileMessage("saved");
    } catch {
      setProfileError("saveFailed");
    } finally {
      setSavingProfile(false);
    }
  };

  const inputClass =
    "w-full min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-2 text-sm text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30";

  if (!authenticated) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <h1 className={`${TYPE.pageTitle} ${SECTION.headingGap}`}>{t("title")}</h1>
        <p className="text-sm text-muted-ink mb-6">{t("subtitle")}</p>
        <form onSubmit={(e) => void handleSignIn(e)} className="flex flex-col gap-3 max-w-md">
          <label className="text-sm text-muted-ink" htmlFor="partner-email">
            {t("email.label")}
          </label>
          <input
            id="partner-email"
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setAuthError(null);
            }}
            placeholder={t("email.placeholder")}
            autoComplete="username"
            aria-label={t("email.aria")}
            className={inputClass}
          />
          <label className="text-sm text-muted-ink" htmlFor="partner-secret">
            {t("secret.label")}
          </label>
          <input
            id="partner-secret"
            type="password"
            value={secretInput}
            onChange={(e) => {
              setSecretInput(e.target.value);
              setAuthError(null);
            }}
            placeholder={t("secret.placeholder")}
            autoComplete="current-password"
            aria-label={t("secret.aria")}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={!emailInput.trim() || !secretInput.trim() || loading}
            className={CTA.primaryCompact}
          >
            {t("submit")}
          </button>
        </form>
        {authError && <p className="text-sm text-terracotta mt-2">{t("invalid")}</p>}
        <div className="mt-8">
          <BackLink href="/" label={tNav("home")} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className={TYPE.pageTitle}>{t("title")}</h1>
          <BackLink href="/" label={tNav("home")} />
        </div>
        <div className="space-y-6">
          <div className={`h-8 w-48 ${SKELETON.bar}`} aria-hidden />
          <div className={`h-24 ${SKELETON.block}`} aria-hidden />
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <p className="text-terracotta">{t("loadError", { error: loadError })}</p>
      </div>
    );
  }

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={TYPE.pageTitle}>{t("title")}</h1>
          {partner && (
            <p className="text-sm text-muted-ink mt-2">{t("greeting", { name: partner.providerName })}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm text-muted-ink hover:text-olive min-h-[44px] px-2"
          >
            {t("signOut")}
          </button>
          <BackLink href="/" label={tNav("home")} />
        </div>
      </div>

      <section className="mb-10">
        <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{t("requests.title")}</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-ink">{t("requests.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-lg border border-sand-200/80 bg-olive/5 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-olive">
                      {t("requests.guest")}: {booking.guestName}
                    </p>
                    <p className="text-sm text-muted-ink break-words">{booking.guestEmail}</p>
                    <p className="text-sm text-muted-ink mt-1">
                      {t("requests.meta", { date: booking.date, party: booking.partySize })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-ink">
                    {t("requests.status")}: {t(`status.${booking.status}`)}
                  </p>
                </div>
                {booking.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => void handleStatus(booking.id, "confirmed")}
                      className={CTA.primaryCompact}
                      aria-label={t("requests.acceptAria", { guest: booking.guestName })}
                    >
                      {t("requests.accept")}
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => void handleStatus(booking.id, "cancelled")}
                      className={CTA.secondaryCompact}
                      aria-label={t("requests.declineAria", { guest: booking.guestName })}
                    >
                      {t("requests.decline")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {requestError && <p className="text-sm text-terracotta mt-3">{t("requests.updateFailed")}</p>}
      </section>

      <section className="mb-10">
        <h2 className={`${TYPE.cardTitle} ${SECTION.headingGap}`}>{t("profile.title")}</h2>
        <form onSubmit={(e) => void handleSaveProfile(e)} className="flex flex-col gap-3 max-w-xl">
          <label className="text-sm text-muted-ink" htmlFor="partner-hours">
            {t("profile.hoursLabel")}
          </label>
          <textarea
            id="partner-hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            aria-label={t("profile.hoursAria")}
            placeholder={t("profile.hoursPlaceholder")}
            rows={3}
            className="w-full min-h-[88px] rounded-lg border border-sand-200/80 px-4 py-2 text-sm text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30"
          />
          <label className="text-sm text-muted-ink" htmlFor="partner-image">
            {t("profile.imageLabel")}
          </label>
          <input
            id="partner-image"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            aria-label={t("profile.imageAria")}
            placeholder={t("profile.imagePlaceholder")}
            className={inputClass}
          />
          <p className="text-xs text-muted-ink">{t("profile.imageHint")}</p>
          <p className="text-xs text-muted-ink">{t("profile.ephemeralNote")}</p>
          <button type="submit" disabled={savingProfile} className={CTA.primaryCompact}>
            {t("profile.save")}
          </button>
          {profileMessage && <p className="text-sm text-sage">{t("profile.saved")}</p>}
          {profileError === "unsafeImage" && (
            <p className="text-sm text-terracotta">{t("profile.unsafeImage")}</p>
          )}
          {profileError === "saveFailed" && (
            <p className="text-sm text-terracotta">{t("profile.saveFailed")}</p>
          )}
        </form>
      </section>
    </div>
  );
}
