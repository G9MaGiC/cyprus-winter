"use client";

import AppLink from "@/components/AppLink";
import { NATURE_PARTNER_LINKS } from "@/lib/nature-excursions";
import { CARD, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function NatureCrosslinksStrip() {
  const t = useTranslations("nature.page.crosslinks");

  const links = [
    { href: "/trails", label: t("trails"), internal: true },
    { href: "/cycling", label: t("cycling"), internal: true },
    { href: "/discover?filter=climbing", label: t("climbing"), internal: true },
    { href: NATURE_PARTNER_LINKS.visitCyprusBirdwatching, label: t("birdwatchingVc") },
    { href: NATURE_PARTNER_LINKS.birdLifeCyprus, label: t("birdLife") },
    { href: NATURE_PARTNER_LINKS.cyprusRocks, label: t("cyprusRocks") },
    { href: NATURE_PARTNER_LINKS.visitCyprusClimbing, label: t("climbingVc") },
    { href: NATURE_PARTNER_LINKS.visitCyprusTrails, label: t("trailsVc") },
  ] as const;

  return (
    <section aria-labelledby="nature-crosslinks" className="mt-12 sm:mt-16">
      <div className={`${CARD.base} ${CARD.content} border-s-4 border-s-sage`}>
        <h2 id="nature-crosslinks" className={`${TYPE.cardTitle} text-charcoal mb-2`}>
          {t("title")}
        </h2>
        <p className="text-sm text-olive/70 mb-4 max-w-2xl">{t("body")}</p>
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.label}>
              {"internal" in link && link.internal ? (
                <AppLink href={link.href} className={SECTION.aegeanLink}>
                  {link.label}
                </AppLink>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SECTION.aegeanLink}
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
