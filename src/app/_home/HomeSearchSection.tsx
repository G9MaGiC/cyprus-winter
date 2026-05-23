import "server-only";

import { getHomeSearchSectionProps } from "@/app/_home/home-search-data";
import HomeSearchSectionView from "@/app/_home/HomeSearchSectionView";

type Props = { locale?: string };

export default async function HomeSearchSection({ locale }: Props) {
  const props = await getHomeSearchSectionProps(locale);
  return <HomeSearchSectionView {...props} />;
}
