import "server-only";

import { LAYOUT, SECTION } from "@/lib/design-tokens";
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";
import HomeInsiderTip from "@/app/_home/HomeInsiderTip";
import HomeTemplateLinks from "@/app/_home/HomeTemplateLinks";
import { getTranslations } from "next-intl/server";

type Props = { locale?: string };

export default async function HomeFooter({ locale }: Props) {
  const tHome = await getTranslations("home");
  return (
    <section aria-label={tHome("footerSection")} className={`${SECTION.alt} ${LAYOUT.safeAreaX}`}>
      <div className={`${LAYOUT.list} mx-auto ${SECTION.blockGap}`}>
        <div className={SECTION.py}>
          <WhyCyprusDetails locale={locale} />
        </div>
        <div className={`${SECTION.pySub} pt-0`}>
          <HomeInsiderTip locale={locale} />
        </div>
        <div className={`${SECTION.pySub} pt-0`}>
          <HomeTemplateLinks locale={locale} />
        </div>
      </div>
    </section>
  );
}
