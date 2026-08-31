"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppLink from "@/components/AppLink";
import { trackProduct } from "@/lib/analytics";
import {
  commonGuideLanguages,
  filterLicensedGuides,
  licensedGuideCount,
  formatGuideName,
  guideLanguageLabel,
  type LicensedGuide,
  TOURIST_GUIDE_DISTRICTS,
} from "@/lib/guides-directory";
import { getVerifiedPartnerForLicensedId } from "@/lib/guide-partners";
import ClientPillFilter from "@/components/ClientPillFilter";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type Props = {
  initialDistrict?: string | null;
  initialLanguage?: string | null;
};

export default function GuidesDirectoryClient({
  initialDistrict = null,
  initialLanguage = null,
}: Props) {
  const t = useTranslations("guides.directory");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const hasTrackedView = useRef(false);
  const [district, setDistrict] = useState<string | null>(initialDistrict);
  const [language, setLanguage] = useState<string | null>(initialLanguage);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;
    trackProduct("guide_directory_view", {
      source: searchParams.get("from") ?? "direct",
      district: initialDistrict ?? "all",
      language: initialLanguage ?? "all",
    });
  }, [initialDistrict, initialLanguage, searchParams]);

  const filtered = useMemo(
    () => filterLicensedGuides({ district, language, query }),
    [district, language, query]
  );

  const languageOptions = useMemo(() => commonGuideLanguages(), []);
  const totalGuides = useMemo(() => licensedGuideCount(), []);
  const isFiltered = Boolean(district || language || query.trim());

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-ink leading-relaxed max-w-2xl">{t("disclaimer")}</p>
      <p className="text-sm text-muted-ink">
        <a
          href="https://www.visitcyprus.com/tourist-guides/"
          target="_blank"
          rel="noopener noreferrer"
          className={SECTION.aegeanLink}
        >
          {t("officialListLink")}
        </a>
      </p>

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="sr-only">{t("searchLabel")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-sand-200 bg-white text-olive placeholder:text-muted-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
          />
        </label>

        <div>
          <p className={`${TYPE.kicker} text-sage mb-2`}>{t("filterDistrict")}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterDistrict")}>
            <ClientPillFilter active={!district} onClick={() => setDistrict(null)} label={t("allDistricts")} />
            {TOURIST_GUIDE_DISTRICTS.filter((d) => d !== "general").map((d) => (
              <ClientPillFilter
                key={d}
                active={district === d}
                onClick={() => setDistrict(district === d ? null : d)}
                label={t(`districts.${d}`)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className={`${TYPE.kicker} text-sage mb-2`}>{t("filterLanguage")}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterLanguage")}>
            <ClientPillFilter active={!language} onClick={() => setLanguage(null)} label={t("allLanguages")} />
            {languageOptions.map((lang) => (
              <ClientPillFilter
                key={lang}
                active={language === lang}
                onClick={() => setLanguage(language === lang ? null : lang)}
                label={guideLanguageLabel(lang)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* The intro promises the full official count; when a filter (incl. the
          silent locale-language pre-filter) narrows the list, say so instead
          of showing two contradicting numbers (AUD-70). */}
      <p className="text-sm text-muted-ink" aria-live="polite">
        {isFiltered && filtered.length < totalGuides
          ? t("resultCountFiltered", { count: filtered.length, total: totalGuides })
          : t("resultCount", { count: filtered.length })}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className={`${CARD.base} ${CARD.content} text-center space-y-3`}>
          <p className="text-muted-ink text-sm">{t("empty")}</p>
          <button
            type="button"
            onClick={() => {
              setDistrict(null);
              setLanguage(null);
              setQuery("");
            }}
            className={CTA.chipTertiary}
          >
            {tCommon("clearFilters")}
          </button>
        </div>
      )}

      <div className={`${CARD.base} ${CARD.content} border-s-4 border-s-aegean`}>
        <p className={`${TYPE.cardTitle} text-charcoal mb-1`}>{t("verifiedCta.title")}</p>
        <p className="text-sm text-muted-ink mb-3">{t("verifiedCta.body")}</p>
        <AppLink href="/book/guide" className={CTA.secondaryCompact}>
          {t("verifiedCta.button")}
        </AppLink>
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: LicensedGuide }) {
  const t = useTranslations("guides.directory");
  const phone = guide.phones[0];
  const verifiedPartner = getVerifiedPartnerForLicensedId(guide.id);

  return (
    <li className={`${CARD.base} ${CARD.content} ${CARD.hover}`}>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <p className={`${TYPE.cardTitle} text-charcoal`}>{formatGuideName(guide.name)}</p>
        {verifiedPartner && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-aegean/15 text-aegean">
            {t("verifiedPartnerBadge")}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-ink mt-0.5">{t(`districts.${guide.district}`)}</p>
      <p className="text-sm text-muted-ink mt-2 line-clamp-2">
        {guide.languages.map((l) => guideLanguageLabel(l)).join(" · ")}
      </p>
      <div className="mt-3 flex flex-col gap-2 text-sm">
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={SECTION.aegeanLink}>
            {phone}
          </a>
        )}
        <a href={`mailto:${guide.email}`} className={`${SECTION.aegeanLink} break-all`}>
          {guide.email}
        </a>
      </div>
      {verifiedPartner && (
        <AppLink
          href={`/book/guide/${verifiedPartner.id}?from=directory`}
          className={`mt-3 inline-flex ${CTA.secondaryCompact}`}
        >
          {t("verifiedPartnerBook")}
        </AppLink>
      )}
    </li>
  );
}
