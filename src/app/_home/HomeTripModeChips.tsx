"use client";

import AppLink from "@/components/AppLink";
import PostHeroBand from "@/components/PostHeroBand";
import { PILL, POST_HERO } from "@/lib/design-tokens";
import { getPathWithoutLocale, isActive } from "@/lib/nav";
import { usePathname } from "next/navigation";
import { Route, MapPin, Plane } from "lucide-react";
import { useTranslations } from "next-intl";

const MODES = [
  { key: "arriving" as const, href: "/airport", Icon: Plane },
  { key: "planning" as const, href: "/plan", Icon: Route },
  { key: "exploring" as const, href: "/discover", Icon: MapPin },
] as const;

export default function HomeTripModeChips() {
  const t = useTranslations("home.tripModes");
  const pathname = usePathname();
  const path = getPathWithoutLocale(pathname);
  const onHome = path === "/" || path === "";

  return (
    <PostHeroBand>
      <nav className={POST_HERO.chipNav} aria-label={t("aria")}>
        {MODES.map(({ key, href, Icon }) => {
          const active = !onHome && isActive(pathname, href);
          return (
            <AppLink
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${PILL.base} ${active ? PILL.active : PILL.neutral} gap-2 min-h-[44px]`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-aegean"}`}
                aria-hidden
              />
              {t(key)}
            </AppLink>
          );
        })}
      </nav>
    </PostHeroBand>
  );
}
