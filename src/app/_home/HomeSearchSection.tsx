import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";
import { getTranslations } from "next-intl/server";

export default async function HomeSearchSection() {
  const tHome = await getTranslations("home");
  return (
    <section
      aria-labelledby="home-search-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.pySub} bg-background`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2 id="home-search-heading" className="sr-only">
          {tHome("search.srHeading")}
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className={`text-center ${TYPE.kicker} mb-4`}>
            {tHome("search.kicker")}
          </p>
          <SearchBar placeholder={tHome("search.placeholder")} className="w-full" />
        </div>
      </div>
    </section>
  );
}
