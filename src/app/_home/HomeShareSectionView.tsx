"use client";

import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import ShareLinks from "@/components/ShareLinks";
import BackToTopLink from "@/components/BackToTopLink";

export type HomeShareSectionViewProps = {
  heading: string;
  body: string;
  shareWithLabel: string;
  shareText: string;
  shareViaAria: string;
  sharePath: string;
};

export default function HomeShareSectionView({
  heading,
  body,
  shareWithLabel,
  shareText,
  shareViaAria,
  sharePath,
}: HomeShareSectionViewProps) {
  return (
    <section
      aria-labelledby="home-share-heading"
      className={`bg-charcoal text-white ${SECTION.py} pb-[max(3rem,env(safe-area-inset-bottom))] text-center`}
    >
      <div className={`${LAYOUT.safeAreaX} ${LAYOUT.listNarrow} mx-auto`}>
        <h2 id="home-share-heading" className="sr-only">
          {heading}
        </h2>
        <p className="text-white/90 font-semibold text-lg">{heading}</p>
        <p className="text-white/80 text-sm mt-3 max-w-lg mx-auto leading-relaxed prose-body">
          {body}
        </p>
        <p
          className={`${TYPE.kickerOnDark} text-white/90 text-xs font-medium uppercase tracking-wider mt-6 mb-2`}
        >
          {shareWithLabel}
        </p>
        <div className="flex justify-center gap-4">
          <ShareLinks
            path={sharePath}
            text={shareText}
            ariaLabel={shareViaAria}
            className="share-links-footer"
          />
        </div>
        <div className="mt-6 pt-4 border-t border-white/20">
          <BackToTopLink />
        </div>
      </div>
    </section>
  );
}
