import AppLink from "@/components/AppLink";
import { CTA, SECTION } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

type Chip = {
  href: string;
  label: string;
  ariaLabel: string;
  variant: "primary" | "secondary" | "tertiary";
};

function chipClass(v: Chip["variant"]) {
  if (v === "primary") return CTA.chipPrimary;
  if (v === "secondary") return CTA.chipSecondary;
  return CTA.chipTertiary;
}

export default async function CategoryChips() {
  const t = await getTranslations("home");
  const primary: Chip[] = [
    { href: "/discover?filter=village", label: t("startHere.chip.villages"), ariaLabel: t("startHere.chip.villages"), variant: "primary" },
    { href: "/discover?filter=winery", label: t("startHere.chip.wineries"), ariaLabel: t("startHere.chip.wineries"), variant: "primary" },
    { href: "/trails", label: t("startHere.chip.trails"), ariaLabel: t("startHere.chip.trails"), variant: "secondary" },
    { href: "/events", label: t("startHere.chip.events"), ariaLabel: t("startHere.chip.events"), variant: "secondary" },
    { href: "/discover?filter=family", label: t("startHere.chip.familyFriendly"), ariaLabel: t("startHere.chip.familyFriendly"), variant: "secondary" },
    { href: "/trails", label: t("startHere.chip.trailConditions"), ariaLabel: t("startHere.chip.trailConditions"), variant: "secondary" },
    { href: "/discover", label: t("startHere.chip.all"), ariaLabel: t("startHere.chip.seeAll"), variant: "secondary" },
  ];
  const also: Chip[] = [
    { href: "/discover?filter=ancient", label: t("startHere.chip.culture"), ariaLabel: t("startHere.chip.culture"), variant: "tertiary" },
    { href: "/discover?filter=beach", label: t("startHere.chip.coasts"), ariaLabel: t("startHere.chip.coasts"), variant: "tertiary" },
    { href: "/discover?filter=monastery", label: t("startHere.chip.monasteries"), ariaLabel: t("startHere.chip.monasteries"), variant: "tertiary" },
  ];
  return (
    <>
      <div className="relative">
        <div
          className="flex flex-nowrap sm:flex-wrap overflow-x-auto scroll-smooth scroll-touch sm:overflow-visible justify-start sm:justify-center gap-3 pb-2 -mx-1 sm:mx-0 px-1 sm:px-0 snap-x snap-mandatory overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="navigation"
          aria-label={t("startHere.aria.browseByCategory")}
        >
          {primary.map((c) => (
            <AppLink key={`${c.href}-${c.label}`} href={c.href} className={chipClass(c.variant)} aria-label={c.ariaLabel}>
              {c.label}
            </AppLink>
          ))}
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-r from-transparent to-sand/80 sm:hidden"
          aria-hidden
        />
      </div>

      <div className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-sand-200/80`}>
        <p className={`text-center text-sage text-sm ${SECTION.titleGap}`}>{t("startHere.alsoSubtitle")}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {also.map((c) => (
            <AppLink key={`${c.href}-${c.label}`} href={c.href} className={chipClass(c.variant)} aria-label={c.ariaLabel}>
              {c.label}
            </AppLink>
          ))}
        </div>
      </div>
    </>
  );
}

