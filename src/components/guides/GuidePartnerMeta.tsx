"use client";

import { guideLanguageLabel } from "@/lib/guides-directory";
import type { Guide } from "@/data/guides";

type Props = {
  guide: Guide;
  districtLabel?: string;
};

export default function GuidePartnerMeta({ guide, districtLabel }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {districtLabel && (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sand-100 text-muted-ink">
          {districtLabel}
        </span>
      )}
      {guide.languages.slice(0, 4).map((lang) => (
        <span
          key={lang}
          className="px-2.5 py-1 rounded-full text-xs font-medium bg-sand-100 text-muted-ink"
        >
          {guideLanguageLabel(lang)}
        </span>
      ))}
      {guide.languages.length > 4 && (
        <span className="text-xs text-muted-ink">+{guide.languages.length - 4}</span>
      )}
    </div>
  );
}
