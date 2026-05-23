"use client";

import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD, SECTION, TYPE } from "@/lib/design-tokens";

export type HomeThisWeekGridViewProps = {
  weatherKicker: string;
  weatherHeading: string;
  weatherTip: string;
  trailsKicker: string;
  trailName: string;
  trailLabel: string;
  trailHref: string;
  trailStatus: "open" | "caution" | "closed" | null;
  addToPlanLabel: string;
  featuredTrailId: string;
  viewAllConditionsLabel: string;
  eventsKicker: string;
  eventTitle: string;
  eventSubtitle: string;
  eventHref: string;
};

function statusDotClass(status: HomeThisWeekGridViewProps["trailStatus"]) {
  if (status === "open") return "bg-aegean/70";
  if (status === "caution") return "bg-golden/70";
  if (status === "closed") return "bg-terracotta/70";
  return "bg-sand-300";
}

export default function HomeThisWeekGridView({
  weatherKicker,
  weatherHeading,
  weatherTip,
  trailsKicker,
  trailName,
  trailLabel,
  trailHref,
  trailStatus,
  addToPlanLabel,
  featuredTrailId,
  viewAllConditionsLabel,
  eventsKicker,
  eventTitle,
  eventSubtitle,
  eventHref,
}: HomeThisWeekGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
      <AppLink
        href="/weather"
        prefetch="auto"
        className={`${CARD.base} ${CARD.hover} ${CARD.link} ${CARD.interactive} border-l-4 border-l-aegean rounded-xl group`}
      >
        <div className={CARD.content}>
          <p className={`${TYPE.kicker} text-sage`}>{weatherKicker}</p>
          <p
            className={`${TYPE.stat} mt-0.5 group-hover:text-terracotta transition-colors text-balance`}
          >
            {weatherHeading}
          </p>
          <p className={`${TYPE.statSub} mt-0.5`}>{weatherTip}</p>
        </div>
      </AppLink>

      <div
        className={`${CARD.base} ${CARD.hover} ${CARD.interactive} border-l-4 border-l-sage flex flex-col group`}
      >
        <AppLink href={trailHref} className={`flex-1 ${CARD.link} ${CARD.content}`}>
          <p className={`${TYPE.kicker} text-sage`}>{trailsKicker}</p>
          <p className={`${TYPE.cardTitleCompact} mt-0.5 truncate`} title={trailName}>
            {trailName}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-sage mt-0.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass(trailStatus)}`}
              aria-hidden
            />
            {trailLabel}
          </p>
        </AppLink>
        <div className={CARD.footer}>
          <div className="flex flex-wrap items-center gap-2">
            <AddToItineraryButton placeId={featuredTrailId} label={addToPlanLabel} className="text-sm" />
            <AppLink
              href="/trails"
              prefetch="auto"
              className={`text-sm font-medium transition-colors ${SECTION.aegeanLink}`}
            >
              {viewAllConditionsLabel}
            </AppLink>
          </div>
        </div>
      </div>

      <AppLink
        href={eventHref}
        prefetch="auto"
        className={`${CARD.base} ${CARD.hover} ${CARD.link} ${CARD.interactive} border-l-4 border-l-golden flex flex-col group`}
      >
        <div className={CARD.content}>
          <p className={`${TYPE.kicker} text-sage`}>{eventsKicker}</p>
          <p className={`${TYPE.cardTitleCompact} mt-0.5 truncate`} title={eventTitle}>
            {eventTitle}
          </p>
          <p className="text-sm text-sage mt-0.5 line-clamp-2 break-words">{eventSubtitle}</p>
        </div>
      </AppLink>
    </div>
  );
}
