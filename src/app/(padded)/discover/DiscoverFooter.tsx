"use client";

import HubFooter from "@/components/HubFooter";
import { useTranslations } from "next-intl";

type DiscoverFooterProps = {
  onScrollToMap?: () => void;
};

export default function DiscoverFooter({ onScrollToMap }: DiscoverFooterProps) {
  const tDiscover = useTranslations("discover");
  return (
    <HubFooter
      body={tDiscover("footer.body")}
      ariaLabel={tDiscover("aria.actions")}
      primaryLabel={tDiscover("footer.addToPlan")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      onScrollToMap={onScrollToMap}
      scrollToMapLabel={onScrollToMap ? tDiscover("footer.seeMap") : undefined}
      scrollToMapAriaLabel={tDiscover("aria.scrollToMap")}
    />
  );
}
