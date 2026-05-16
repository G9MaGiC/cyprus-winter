"use client";

import AppLink from "@/components/AppLink";
import { PILL } from "@/lib/design-tokens";
import { Route, MapPin, Plane } from "lucide-react";
import { useTranslations } from "next-intl";

const MODES = [
  { key: "arriving" as const, href: "/airport", Icon: Plane },
  { key: "planning" as const, href: "/plan", Icon: Route },
  { key: "exploring" as const, href: "/discover", Icon: MapPin },
];

export default function HomeTripModeChips() {
  const t = useTranslations("home.tripModes");

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 px-4 -mt-2 mb-6"
      aria-label={t("aria")}
    >
      {MODES.map(({ key, href, Icon }) => (
        <AppLink
          key={key}
          href={href}
          className={`${PILL.base} ${PILL.neutral} gap-2 min-h-[44px]`}
        >
          <Icon className="h-4 w-4 text-aegean shrink-0" aria-hidden />
          {t(key)}
        </AppLink>
      ))}
    </nav>
  );
}
