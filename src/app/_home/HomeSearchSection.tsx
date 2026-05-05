import AppLink from "@/components/AppLink";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";

export default function HomeSearchSection() {
  return (
    <section
      aria-labelledby="home-search-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.pySub} bg-background`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2 id="home-search-heading" className="sr-only">
          Search places and trails
        </h2>
        <div className="max-w-xl mx-auto">
          <p className={`text-center ${TYPE.kicker} mb-2`}>
            Search matches names in our catalog—places, trails, events.
          </p>
          <p className="text-center text-sm text-olive/75 mb-3 leading-relaxed">
            Prefer to browse? Go to{" "}
            <AppLink href="/#start-here" className={SECTION.aegeanLink}>
              Start here
            </AppLink>{" "}
            for categories, regions, and moods—or use the AI guide.
          </p>
          <SearchBar placeholder="Find a place, trail, or event" className="w-full" />
        </div>
      </div>
    </section>
  );
}
