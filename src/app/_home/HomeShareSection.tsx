import { LAYOUT, SECTION } from "@/lib/design-tokens";
import ShareLinks from "@/components/ShareLinks";
import BackToTopLink from "@/components/BackToTopLink";
import { getTranslations } from "next-intl/server";

type HomeShareSectionProps = {
  sharePath?: string;
};

const defaultSharePath = "/";

export default async function HomeShareSection({ sharePath = defaultSharePath }: HomeShareSectionProps) {
  const t = await getTranslations("home");
  return (
    <section
      aria-labelledby="home-share-heading"
      className={`bg-charcoal text-white ${SECTION.py} pb-[max(3rem,env(safe-area-inset-bottom))] text-center`}
    >
      <div className={`${LAYOUT.safeAreaX} ${LAYOUT.listNarrow} mx-auto`}>
        <h2 id="home-share-heading" className="sr-only">
          {t("share.heading")}
        </h2>
        <p className="text-white/90 font-semibold text-lg">{t("share.heading")}</p>
        <p className="text-white/80 text-sm mt-3 max-w-lg mx-auto leading-relaxed prose-body">
          {t("share.body")}
        </p>
        <p className="text-white/90 text-xs font-medium uppercase tracking-wider mt-6 mb-2 prose-label">
          {t("share.shareWithLabel")}
        </p>
        <div className="flex justify-center gap-4">
          <ShareLinks
            path={sharePath}
            text={t("share.shareText")}
            ariaLabel={t("share.shareViaAria")}
            className="share-links-footer"
          />
        </div>
        <div className="mt-6 pt-4 border-t border-white/20">
          <BackToTopLink />
        </div>
      </div>
    </section>
  );
}
