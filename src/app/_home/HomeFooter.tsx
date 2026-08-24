import "server-only";

import { HOME, LAYOUT, SECTION } from "@/lib/design-tokens";
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";
import HomeInsiderTip from "@/app/_home/HomeInsiderTip";
import HomeTemplateLinks from "@/app/_home/HomeTemplateLinks";
import TravelTrustStrip from "@/components/travel/TravelTrustStrip";
import { getTranslations } from "next-intl/server";

type Props = { locale?: string };

export default async function HomeFooter({ locale }: Props) {
  const tHome = await getTranslations("home");
  return (
    <section aria-label={tHome("footerSection")} className={`${SECTION.alt} ${LAYOUT.safeAreaX}`}>
      <div className={`${LAYOUT.list} mx-auto ${SECTION.blockGap} ${HOME.sectionPy}`}>
        <WhyCyprusDetails locale={locale} />
        <HomeInsiderTip locale={locale} />
        <HomeTemplateLinks locale={locale} />
        <TravelTrustStrip />
      </div>
    </section>
  );
}
