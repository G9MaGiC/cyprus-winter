import "server-only";

import { getHomeShareSectionProps } from "@/app/_home/home-share-data";
import HomeShareSectionView from "@/app/_home/HomeShareSectionView";

type HomeShareSectionProps = {
  sharePath?: string;
  locale?: string;
};

const defaultSharePath = "/";

export default async function HomeShareSection({
  sharePath = defaultSharePath,
  locale,
}: HomeShareSectionProps) {
  const props = await getHomeShareSectionProps(sharePath, locale);
  return <HomeShareSectionView {...props} />;
}
