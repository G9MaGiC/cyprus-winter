import "server-only";

import { LAYOUT, SECTION } from "@/lib/design-tokens";
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";
import HomeInsiderTip from "@/app/_home/HomeInsiderTip";
import HomeTemplateLinks from "@/app/_home/HomeTemplateLinks";

type Props = { locale?: string };

export default function HomeFooter({ locale }: Props) {
  return (
    <footer role="contentinfo" className={`${SECTION.alt} ${LAYOUT.safeAreaX}`}>
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
    </footer>
  );
}
