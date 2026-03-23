import { Link } from "@/i18n/navigation";
import HomePageContent from "@/app/_home/HomePageContent";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const tHome = await getTranslations({ locale, namespace: "home" });

  return (
    <HomePageContent
      LinkComponent={Link}
      planSubtitle={tHome("planSubtitle")}
    />
  );
}
