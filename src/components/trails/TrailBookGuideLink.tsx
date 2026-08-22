"use client";

import AppLink from "@/components/AppLink";
import { TrackOnClick } from "@/components/TrackOnClick";
import { useTranslations } from "next-intl";

type TrailBookGuideLinkProps = {
  verifiedGuideId?: string | null;
  trailId: string;
  directoryHref: string;
  className: string;
};

export default function TrailBookGuideLink({
  verifiedGuideId,
  trailId,
  directoryHref,
  className,
}: TrailBookGuideLinkProps) {
  const t = useTranslations("trails.detail");

  const href = verifiedGuideId
    ? `/book/guide/${verifiedGuideId}?trail=${trailId}`
    : directoryHref;

  return (
    <TrackOnClick
      event="guide_match_click"
      properties={{
        source: "trail",
        match_type: verifiedGuideId ? "verified" : "directory",
        trail_id: trailId,
        ...(verifiedGuideId ? { guide_id: verifiedGuideId } : {}),
      }}
    >
      <AppLink href={href} className={className}>
        {t("bookGuide")}
      </AppLink>
    </TrackOnClick>
  );
}
