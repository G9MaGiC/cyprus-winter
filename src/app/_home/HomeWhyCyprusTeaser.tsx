import "server-only";

import { CARD, HOME, LAYOUT } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

type Props = { locale?: string };

/**
 * Emotional blockquote surfaced early in the home scroll.
 */
export default async function HomeWhyCyprusTeaser({ locale }: Props) {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  return (
    <section
      aria-labelledby="why-winter-teaser"
      className={`${HOME.sectionPySub} bg-sand/50 ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.listNarrow} mx-auto`}>
        <blockquote
          id="why-winter-teaser"
          className={`${CARD.base} ${CARD.content} border-s-4 border-s-sage/50 text-center`}
        >
          <p className="text-olive text-base sm:text-lg leading-relaxed prose-quote">
            {t("whyCyprusTeaser.quote")}
          </p>
        </blockquote>
      </div>
    </section>
  );
}
