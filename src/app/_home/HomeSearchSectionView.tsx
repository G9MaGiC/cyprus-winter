"use client";

import { HOME, LAYOUT, TYPE } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";

export type HomeSearchSectionViewProps = {
  srHeading: string;
  kicker: string;
  placeholder: string;
};

export default function HomeSearchSectionView({
  srHeading,
  kicker,
  placeholder,
}: HomeSearchSectionViewProps) {
  return (
    <section
      aria-labelledby="home-search-heading"
      className={`${LAYOUT.safeAreaX} ${HOME.sectionPySub} bg-background`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2 id="home-search-heading" className="sr-only">
          {srHeading}
        </h2>
        <div className="max-w-xl mx-auto">
          <p className={`text-center ${TYPE.kicker} mb-3`}>{kicker}</p>
          <SearchBar placeholder={placeholder} className="w-full" />
        </div>
      </div>
    </section>
  );
}
