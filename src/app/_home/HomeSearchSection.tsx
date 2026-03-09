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
          <p className={`text-center ${TYPE.kicker} mb-3`}>
            Not sure where to start? Find a place, trail, or ask the island.
          </p>
          <SearchBar placeholder="Find a place, trail, or event" className="w-full" />
        </div>
      </div>
    </section>
  );
}
