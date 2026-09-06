import { getTranslations } from "next-intl/server";
import SiteFooter from "./SiteFooter";
import LocaleLinks from "./LocaleLinks";

/** Fetches translated footer labels and renders SiteFooter. */
export default async function FooterWithTranslations() {
  const t = await getTranslations("footer");

  const labels = {
    tagline: t("tagline"),
    discover: t("discover"),
    plan: t("plan"),
    weather: t("weather"),
    bookings: t("bookings"),
    arriving: t("arriving"),
    beaches: t("beaches"),
    wineries: t("wineries"),
    villages: t("villages"),
    cycling: t("cycling"),
    troodos: t("troodos"),
    paphos: t("paphos"),
    practical: t("practical"),
    install: t("install"),
    privacy: t("privacy"),
    terms: t("terms"),
  };

  return <SiteFooter labels={labels} localeSwitcher={<LocaleLinks />} />;
}
