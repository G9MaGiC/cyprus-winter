import type { ComponentType } from "react";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";
import HomeInsiderTip from "@/app/_home/HomeInsiderTip";
import HomeTemplateLinks from "@/app/_home/HomeTemplateLinks";
import type { LinkProps } from "@/app/_home/types";

export default function HomeFooter({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  return (
    <footer role="contentinfo" className={`${SECTION.alt} ${LAYOUT.safeAreaX}`}>
      <div className={`${LAYOUT.list} mx-auto ${SECTION.blockGap}`}>
        <div className={SECTION.py}>
          <WhyCyprusDetails />
        </div>
        <div className={`${SECTION.pySub} pt-0`}>
          <HomeInsiderTip LinkComponent={LinkComponent} />
        </div>
        <div className={`${SECTION.pySub} pt-0`}>
          <HomeTemplateLinks LinkComponent={LinkComponent} />
        </div>
      </div>
    </footer>
  );
}
